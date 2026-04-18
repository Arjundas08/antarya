# ANTARYA 🚀
### *The Ultimate AI-Powered Ecosystem for the Modern Kirana Store*

ANTARYA is an industry-grade SaaS solution designed to digitize and supercharge small retail businesses. By blending traditional shopkeeping with cutting-edge AI, ANTARYA transforms a standard "Dukan" into a data-driven enterprise.

---

## 📖 What is ANTARYA?

In the rapidly evolving Indian retail landscape, small shopkeepers (Kiranas) often struggle with manual bookkeeping, inventory loss, and unpredictable cash flows. **ANTARYA** (Meaning: *Insightful* or *Internal Strength*) was built to bridge this digital divide.

It is a comprehensive "Business Intelligence" tool for the small business owner. It doesn't just record sales; it **thinks** for the owner, providing actionable advice through specialized AI agents.

---

## 🛠️ Tech Stack & Architecture

We use a modern **MERN-like** stack optimized for performance and rapid deployment:

- **Frontend**: `React.js` with `Vite` for a lightning-fast experience. 
- **Styling**: Vanilla CSS with a custom **"Bharat Premium"** design system (Glassmorphism, Dark Mode, and high-contrast accessibility).
- **Backend**: `Node.js` & `Express.js` API.
- **Database**: `MongoDB Atlas` for resilient cloud storage and real-time data sync.
- **AI Engine**: `Google Gemini 2.5 Flash` for processing retail logic, OCR, and the Advisory Board.
- **Communication**: Integrated `Bhashini` (Optional) for native language support and voice commands.

---

## 📱 Page-by-Page Breakdown

### 1. **Dashboard (The Nerve Center)**
- **What it does**: Provides a 360-degree view of the business including cash-in-hand, today's revenue, and growth timeline.
- **How it helps**: It allows the owner to see if they are making a profit or loss in real-time without doing manual math. The "Quick Action Grid" ensures no task takes more than two taps.

### 2. **Quick Sale (The Digital Cashier)**
- **What it does**: A high-speed POS system that supports Cash, UPI, and Udhaar (Credit).
- **How it helps**: Automatically deducts items from inventory and updates customer debt records. It supports "Walk-in" customers and registered loyalists.

### 3. **MyStock (Inventory Intelligence)**
- **What it does**: A searchable database of all products with stock levels.
- **How it helps**: Uses visual badges to alert owners when items are "Low" or "Critical". This prevents "stock-out" situations where customers leave because an item isn't available.

### 4. **MyMoney (The Cashbook)**
- **What it does**: Tracks every rupee entering and leaving the shop.
- **How it helps**: Most owners don't track operational costs like Rent, Electricity, or Salaries. MyMoney categorizes these expenses and calculates the **Actual Profit**, not just the sales volume.

### 5. **CRM & Udhaar (The Trust Tracker)**
- **What it does**: Manages customer relationships and credit (Udhaar) history.
- **How it helps**: Identifies "Recent Buyers" and "Inactive Customers". The udhaar system ensures you never forget who owes you money, with one-tap payment collection.

### 6. **AI Advisory Board (The Dukan Ka Dimaag)**
- **Finance Minister**: Analyzes sales data to forecast future revenue.
- **Marketing Guru**: Generates WhatsApp templates and offers to bring back "lost" customers.
- **Ops Manager**: Identifies "dead stock" (items not selling) and helps clear space for better products.

---

## 🌟 Why Antarya? (The Value Prop)

1. **Efficiency**: Reduce manual counting and paper-based entries by 90%.
2. **Growth**: Use AI to identify which products make the most profit, not just the most sales.
3. **Recovery**: Recover pending Udhaar faster with organized debt tracking.
4. **Professionalism**: Impress customers with digital receipts and professional management.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas Account
- Google Gemini API Key

### Installation

1. **Clone the Repo**
   ```bash
   git clone https://github.com/Arjundas08/antarya.git
   cd antarya
   ```

2. **Backend Setup**
   ```bash
   cd server
   npm install
   ```
   Create a `.env` file in the `server` directory:
   ```env
   PORT=5001
   MONGO_URI=your_mongodb_atlas_uri
   GEMINI_API_KEY=your_gemini_api_key
   JWT_SECRET=your_secret_key
   ```

3. **Frontend Setup**
   ```bash
   cd ../client
   npm install
   ```

4. **Run Locally**
   Return to the root directory and run:
   ```bash
   npm run dev
   ```

---

## 🌐 Deployment

### Backend (Render)
- Deploy the `server` directory as a **Web Service**.
- Add Environment Variables (`MONGO_URI`, `GEMINI_API_KEY`, etc.) in the Render dashboard.
- Set Root Directory to `server`.

### Frontend (Vercel)
- Deploy the `client` directory.
- Set Environment Variable `VITE_API_URL` to your Render backend URL.

---

## 📜 License
Distribute under the MIT License. See `LICENSE` for more information.

---
**Built with ❤️ for the Indian Merchant Ecosystem. Let's grow together.**
