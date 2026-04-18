const mongoose = require('mongoose');

const connectDB = async () => {
  console.log('--- Startup Diagnostics ---');
  console.log('MONGO_URI exists:', !!process.env.MONGO_URI);
  console.log('GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY);
  console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
  console.log('PORT:', process.env.PORT);
  console.log('---------------------------');

  if (!process.env.MONGO_URI) {
    console.error('❌ FATAL: MONGO_URI is not set. Add it in your environment variables.');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, { family: 4 });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    
    // Automatically fallback to in-memory DB so dev server doesn't crash on IP whitelist errors
    if (process.env.NODE_ENV !== 'production') {
      console.log(`\n⚠️  FALLING BACK TO LOCAL IN-MEMORY MONGODB FOR DEVELOPMENT...`);
      console.log(`⚠️  (Note: Data will be lost when you restart the server)\n`);
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongoServer = await MongoMemoryServer.create();
        const memUri = mongoServer.getUri();
        const conn = await mongoose.connect(memUri);
        console.log(`✅ In-Memory MongoDB Connected successfully!`);
      } catch (fallbackError) {
        console.error(`❌ In-Memory MongoDB fallback failed: ${fallbackError.message}`);
        process.exit(1);
      }
    } else {
      process.exit(1);
    }
  }
};

const shopSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // keeping id for backward compatibility
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  ownerName: { type: String, required: true },
  city: { type: String },
  setupComplete: { type: Boolean, default: false }
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  id: { type: String, required: true },
  shopId: { type: String, required: true },
  name: { type: String, required: true },
  nameHindi: { type: String },
  emoji: { type: String, default: '📦' },
  sellingPrice: { type: Number, required: true },
  costPrice: { type: Number, required: true },
  unit: { type: String, default: 'pc' },
  category: { type: String, default: 'General' },
  quantity: { type: Number, default: 0 },
  minStock: { type: Number, default: 5 }
}, { timestamps: true });

const customerSchema = new mongoose.Schema({
  id: { type: String, required: true },
  shopId: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: String },
  totalSpent: { type: Number, default: 0 },
  totalCredit: { type: Number, default: 0 }, // positive means they owe money (udhaar)
  lastVisit: { type: Date }
}, { timestamps: true });

const saleSchema = new mongoose.Schema({
  id: { type: String, required: true },
  shopId: { type: String, required: true },
  amount: { type: Number, required: true },
  method: { type: String, enum: ['cash', 'upi', 'udhaar'], required: true },
  items: [{
    productId: { type: String },
    name: { type: String },
    qty: { type: Number },
    price: { type: Number }
  }],
  customerId: { type: String }, // optional, for udhaar
  timestamp: { type: Date, default: Date.now }
});

const expenseSchema = new mongoose.Schema({
  id: { type: String, required: true },
  shopId: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  note: { type: String },
  month: { type: String }, // e.g. "April 2026"
  date: { type: String }, // e.g. "2026-04-18"
  timestamp: { type: Date, default: Date.now }
});

const Shop = mongoose.model('Shop', shopSchema);
const Product = mongoose.model('Product', productSchema);
const Customer = mongoose.model('Customer', customerSchema);
const Sale = mongoose.model('Sale', saleSchema);
const Expense = mongoose.model('Expense', expenseSchema);

module.exports = {
  db: {
    shops: Shop,
    products: Product,
    customers: Customer,
    sales: Sale,
    expenses: Expense
  },
  connectDB
};
