const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../db');
const { authMiddleware } = require('../middleware');

const router = express.Router();
router.use(authMiddleware);

// GET /api/dashboard - Main dashboard data
router.get('/', async (req, res) => {
  try {
    const shop = await db.shops.findOne({ id: req.shopId });
    if (!shop) return res.status(404).json({ error: 'Shop not found' });

    const products = await db.products.find({ shopId: req.shopId });
    const customers = await db.customers.find({ shopId: req.shopId });
    const sales = await db.sales.find({ shopId: req.shopId });
    const expenses = await db.expenses.find({ shopId: req.shopId });

    // legacy map for uniform data structures below:
    const mappedSales = sales.map(s => ({
      total: s.amount,
      createdAt: s.timestamp.toISOString(),
      items: s.items
    }));
    const mappedExpenses = expenses.map(e => ({
      amount: e.amount,
      createdAt: e.timestamp.toISOString()
    }));

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const yesterday = new Date(now - 86400000).toISOString().split('T')[0];
    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // Today's sales
    const todaySales = mappedSales.filter(s => s.createdAt.startsWith(today));
    const todayTotal = todaySales.reduce((sum, s) => sum + s.total, 0);

    // Yesterday's sales
    const yesterdaySales = mappedSales.filter(s => s.createdAt.startsWith(yesterday));
    const yesterdayTotal = yesterdaySales.reduce((sum, s) => sum + s.total, 0);

    // This month
    const monthSales = mappedSales.filter(s => s.createdAt.startsWith(monthStart));
    const monthTotal = monthSales.reduce((sum, s) => sum + s.total, 0);
    const monthExpenses = mappedExpenses.filter(e => e.createdAt.startsWith(monthStart));
    const monthExpenseTotal = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

    // Low stock items
    const lowStock = products.filter(p => p.quantity <= p.minStock);
    const criticalStock = products.filter(p => p.quantity <= 2);

    // Total credit owed by customers
    const totalCredit = customers.reduce((sum, c) => sum + (c.totalCredit || 0), 0);

    // Customers who haven't visited in 15+ days
    const inactiveCustomers = customers.filter(c => {
      if (!c.lastVisit) return false;
      const daysSince = Math.floor((now - new Date(c.lastVisit)) / 86400000);
      return daysSince >= 15 && (c.totalSpent || 0) > 1000;
    });

    // Greeting based on time
    const hour = now.getHours();
    let greeting;
    if (hour < 12) greeting = 'Good morning';
    else if (hour < 17) greeting = 'Good afternoon';
    else greeting = 'Good evening';

    // Daily average (last 30 days)
    const thirtyDaysAgo = new Date(now - 30 * 86400000);
    const last30Sales = mappedSales.filter(s => new Date(s.createdAt) >= thirtyDaysAgo);
    const dailyAverage = last30Sales.length > 0 
      ? last30Sales.reduce((sum, s) => sum + s.total, 0) / 30 
      : 0;

    // Cash runway (days of money left)
    const dailyExpenseAvg = mappedExpenses.length > 0
      ? mappedExpenses.reduce((sum, e) => sum + e.amount, 0) / Math.max(1, Math.ceil((now - new Date(mappedExpenses[0].createdAt)) / 86400000))
      : 0;
    const cashRunway = dailyExpenseAvg > 0 
      // Not tracking strict cash in hand actively but returning legacy calculation
      ? Math.floor((monthTotal - monthExpenseTotal) / dailyExpenseAvg) 
      : 999;

    res.json({
      greeting,
      shopName: shop.name,
      ownerName: shop.ownerName,
      cashInHand: Math.max(0, monthTotal - monthExpenseTotal), // approximating
      todaySales: todayTotal,
      todayTransactions: todaySales.length,
      yesterdaySales: yesterdayTotal,
      monthSales: monthTotal,
      monthExpenses: monthExpenseTotal,
      monthProfit: monthTotal - monthExpenseTotal,
      dailyAverage: Math.round(dailyAverage),
      cashRunway,
      totalProducts: products.length,
      lowStockItems: lowStock.map(p => ({
        id: p.id,
        name: p.name,
        quantity: p.quantity,
        unit: p.unit,
        minStock: p.minStock
      })),
      criticalStockCount: criticalStock.length,
      totalCredit,
      inactiveCustomers: inactiveCustomers.map(c => ({
        id: c.id,
        name: c.name,
        totalSpent: c.totalSpent,
        daysSinceVisit: Math.floor((now - new Date(c.lastVisit)) / 86400000)
      })),
      topCustomers: customers
        .sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0))
        .slice(0, 5)
        .map(c => ({
          id: c.id,
          name: c.name,
          totalSpent: c.totalSpent || 0,
          totalCredit: c.totalCredit || 0,
          lastVisit: c.lastVisit
        }))
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/dashboard/suggestions - Smart suggestions
router.get('/suggestions', async (req, res) => {
  try {
    const products = await db.products.find({ shopId: req.shopId });
    const customers = await db.customers.find({ shopId: req.shopId });
    const sales = await db.sales.find({ shopId: req.shopId }).sort({ timestamp: -1 });

    const suggestions = [];
    const now = new Date();

    // Critical stock
    const critical = products.filter(p => p.quantity <= 2 && p.quantity > 0);
    critical.forEach(p => {
      suggestions.push({
        type: 'restock',
        priority: 'high',
        title: `${p.name} almost finished!`,
        description: `Only ${p.quantity} ${p.unit} left. Order immediately before customers go elsewhere.`,
        action: { label: 'Restock Now', route: '/add-stock' }
      });
    });

    // Out of stock
    const outOfStock = products.filter(p => p.quantity <= 0);
    outOfStock.forEach(p => {
      suggestions.push({
        type: 'restock',
        priority: 'high',
        title: `${p.name} is OUT OF STOCK`,
        description: `You're losing sales every hour! Restock this urgently.`,
        action: { label: 'Add Stock', route: '/add-stock' }
      });
    });

    // Credit collection
    const creditCustomers = customers.filter(c => (c.totalCredit || 0) > 100);
    const totalCredit = creditCustomers.reduce((s, c) => s + (c.totalCredit || 0), 0);
    if (totalCredit > 0) {
      suggestions.push({
        type: 'collect_credit',
        priority: creditCustomers.some(c => c.totalCredit > 2000) ? 'high' : 'medium',
        title: `₹${Math.round(totalCredit).toLocaleString('en-IN')} udhaar pending`,
        description: `${creditCustomers.length} customers owe you money. ${creditCustomers.filter(c => c.totalCredit > 1000).map(c => `${c.name} owes ₹${Math.round(c.totalCredit)}`).slice(0, 2).join(', ')}`,
        action: { label: 'Collect Now', route: '/customers' }
      });
    }

    // Inactive valuable customers
    const inactive = customers.filter(c => {
      if (!c.lastVisit) return false;
      const days = Math.floor((now - new Date(c.lastVisit)) / 86400000);
      return days >= 10 && (c.totalSpent || 0) > 500;
    });

    inactive.forEach(c => {
      const days = Math.floor((now - new Date(c.lastVisit)) / 86400000);
      suggestions.push({
        type: 'inactive_customer',
        priority: days > 20 ? 'medium' : 'low',
        title: `${c.name} missing for ${days} days`,
        description: `They spent ₹${(c.totalSpent || 0).toLocaleString('en-IN')} total. Call or WhatsApp them to bring them back.`,
        action: { label: 'View Customer', route: '/customers' }
      });
    });

    // Growth tip (always show at least one)
    if (suggestions.length < 2) {
      const tips = [
        { title: 'Start tracking expenses', description: 'Record rent, electricity, transport costs to see your real profit. Go to Money → Add Expense.', action: { label: 'Add Expense', route: '/money' } },
        { title: 'Add customer names to sales', description: 'When you record sales, add customer names. This helps you track who buys what and build loyalty.', action: { label: 'Quick Sale', route: '/sale' } },
        { title: 'Use voice for faster sales', description: 'Just say items like "2 kilo atta, 1 litre tel" — the app will find them automatically!', action: { label: 'Try Voice Sale', route: '/sale' } },
      ];
      const tip = tips[Math.floor(Math.random() * tips.length)];
      suggestions.push({
        type: 'growth',
        priority: 'low',
        ...tip
      });
    }

    // Sort: high priority first
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    suggestions.sort((a, b) => (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2));

    res.json({ suggestions });
  } catch (err) {
    console.error('Suggestions error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/dashboard/expense - Add expense with month/date
router.post('/expense', async (req, res) => {
  try {
    const { description, amount, category, month, date } = req.body;
    if (!description || !amount) {
      return res.status(400).json({ error: 'Description and amount are required' });
    }

    const now = new Date();
    const expenseMonth = month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const expenseDate = date || now.toISOString().split('T')[0];

    const expense = new db.expenses({
      id: uuidv4(),
      shopId: req.shopId,
      note: description,
      amount: Number(amount),
      category: category || 'General',
      month: expenseMonth,
      date: expenseDate,
      timestamp: new Date(expenseDate)
    });

    await expense.save();

    res.status(201).json({
      id: expense.id,
      shopId: expense.shopId,
      description: expense.note,
      amount: expense.amount,
      category: expense.category,
      month: expense.month,
      date: expense.date,
      createdAt: expense.timestamp.toISOString()
    });
  } catch (err) {
    console.error('Expense error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/dashboard/expenses - Get all expenses grouped by month
router.get('/expenses', async (req, res) => {
  try {
    const expenses = await db.expenses.find({ shopId: req.shopId }).sort({ timestamp: -1 });

    const mappedExpenses = expenses.map(e => ({
      id: e.id,
      description: e.note,
      amount: e.amount,
      category: e.category,
      month: e.month,
      date: e.date,
      createdAt: e.timestamp.toISOString()
    }));

    // Group by month
    const byMonth = {};
    mappedExpenses.forEach(e => {
      const month = e.month || e.createdAt?.substring(0, 7) || 'Unknown';
      if (!byMonth[month]) {
        byMonth[month] = { month, expenses: [], total: 0 };
      }
      byMonth[month].expenses.push(e);
      byMonth[month].total += e.amount || 0;
    });

    // Convert to sorted array
    const months = Object.values(byMonth).sort((a, b) => b.month.localeCompare(a.month));

    // Category totals for current month
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const currentMonthExpenses = mappedExpenses.filter(e => (e.month || e.createdAt?.substring(0, 7)) === currentMonth);
    const categoryTotals = {};
    currentMonthExpenses.forEach(e => {
      const cat = e.category || 'General';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + (e.amount || 0);
    });

    res.json({
      expenses: mappedExpenses,
      byMonth: months,
      currentMonthTotal: currentMonthExpenses.reduce((s, e) => s + (e.amount || 0), 0),
      categoryTotals
    });
  } catch (err) {
    console.error('Get expenses error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/dashboard/expense/:id
router.delete('/expense/:id', async (req, res) => {
  try {
    const result = await db.expenses.findOneAndDelete({ id: req.params.id, shopId: req.shopId });
    if (!result) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Delete expense error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
