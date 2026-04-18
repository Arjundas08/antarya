# ANTARYA 🚀
### *The Ultimate AI-Powered Ecosystem for the Modern Kirana Store*

ANTARYA is an industry-grade SaaS solution designed to digitize and supercharge small retail businesses. By blending traditional shopkeeping with cutting-edge AI, ANTARYA transforms a standard "Dukan" into a data-driven enterprise.

---

## 🌟 Key Features

### 📊 **Enterprise Dashboard**
- **Real-time Metrics**: Track Daily Sales, Monthly Profit, and Transactions at a glance.
- **FinTech Aesthetics**: A premium, high-contrast UI with glassmorphism and smooth animations.
- **Quick Action Grid**: 8 core tools (Sale, Stock, Inventory, Udhaar, Cashbook, Alerts, AI Chat, Support) accessible in one tap.

### 🧠 **AI Advisory Board**
- **Finance Minister 🟢**: In-depth revenue forecasting and cashflow health analysis.
- **Marketing Guru 🟣**: Automated WhatsApp campaign generation and customer retention strategies.
- **Ops Manager 🟡**: Dead stock detection and intelligent restocking priorities.

### 📦 **Smart Inventory & POS**
- **OCR Inbound**: Scan physical bills to auto-populate inventory using AI OCR.
- **Voice-Powered POS**: Record sales by simply speaking (e.g., "Add 2kg Rice and 1 packet Atta").
- **Critical Alerts**: Visual status badges for "Low Stock" and "Out of Stock" items.

### 💸 **Professional Cashbook**
- **Categorized Expenses**: Track Rent, Electricity, Salaries, and more with dedicated categories.
- **Quick Presets**: Record common recurring expenses in a single click.
- **Profit Analysis**: Automatic monthly profit/loss calculation based on sales and operational costs.

### 👥 **CRM & Udhaar Management**
- **Khata Digitalization**: Track outstanding credits with avatar-based customer lists.
- **Automated Reminders**: Identify and prioritize payment collections from top debtors.

---

## 🛠️ Tech Stack

- **Frontend**: React.js, Vite, Lucide React (Icons), Vanilla CSS (Bharat Premium Theme).
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB Atlas (Mongoose).
- **AI**: Google Gemini AI (Advisory Board & OCR), Bhashini (Translation/Speech - optional).

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
**Built with ❤️ for the Indian Merchant Ecosystem.**
