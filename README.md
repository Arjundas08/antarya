# ANTARYA 🚀
### *The Ultimate AI-Powered Ecosystem for the Modern Kirana Store*

ANTARYA is a highly resilient, industry-grade SaaS solution engineered to digitize and supercharge small retail businesses. By seamlessly blending traditional shopkeeping with state-of-the-art AI, ANTARYA transforms a standard "Dukan" into a fully data-driven enterprise.

---

## 🚀 The Mission: What We Did & Why We Did It

### What We Did
We built a comprehensive **"Business Intelligence & Operations"** platform specifically tailored for Indian retail. It goes far beyond simply recording sales—it actively **thinks** for the owner. It processes complex data (like low stock, customer credit, and historical revenue) and provides actionable intelligence through a suite of specialized AI Agents and Computer Vision modules.

### Why We Did It
Small shopkeepers (Kiranas) struggle with manual bookkeeping, unrecovered credit (Udhaar), inventory loss, and unpredictable cash flows. However, forcing them to learn complex accounting software is destined to fail. 
We built ANTARYA to bridge this digital divide by hiding complex enterprise-grade data analytics behind a friendly, conversational AI layer that speaks in a natural "Hinglish" tone that shopkeepers understand and trust.

---

## 🏗️ System Architecture & Data Flow

Below is the detailed architectural diagram maps out how the different modules of ANTARYA interact, specifically showcasing our robust offline fallback systems.

```mermaid
graph TD
    %% Frontend Layer
    subgraph Frontend [Client UI - React + Vite]
        UI[User Interface]
        State[Context API / LocalStorage]
        Bhashini[Voice Input UI]
        Cam[Camera / Bill Scanner]
        UI --> State
    end

    %% Backend Layer
    subgraph Backend [Server API - Node + Express]
        Router[Express Router]
        Auth[JWT Middleware]
        AI_Controller[AI Fallback Controller]
        DB_Controller[Database Controller]
    end

    %% Database Layer
    subgraph Data [Data Persistence]
        Atlas[(MongoDB Atlas\nPrimary)]
        MemoryDB[(In-Memory DB\nFallback)]
    end

    %% External APIs Layer
    subgraph Services [External Cloud Services]
        Gemini[Google Gemini 2.5 Flash API]
        BhashiniAPI[Bhashini ASR/Translation]
    end

    %% Connections
    UI -- "REST API (JSON)" --> Router
    Bhashini -- "Audio Base64" --> Router
    Cam -- "Image Base64" --> Router

    Router --> Auth
    Auth --> AI_Controller
    Auth --> DB_Controller

    %% Database Routing with Fallback
    DB_Controller -- "Tries to Connect" --> Atlas
    Atlas -- "If Timeout / IP Blocked" -.-> MemoryDB
    DB_Controller -- "Auto-mounts" --> MemoryDB

    %% AI Routing with Fallback
    AI_Controller -- "Requests Analysis" --> Gemini
    Gemini -- "If Quota Exceeded / 429" -.-> AI_Controller
    AI_Controller -- "Injects Offline Demo Data" --> Router
    AI_Controller -- "Requests Translation" --> BhashiniAPI
```

---

## 🧠 Core Modules Deep Dive

### 1. The Nerve Center (Dashboard)
- **Mechanism:** Aggregates data from MongoDB collections (`sales`, `products`, `customers`, `expenses`) to provide a real-time 360-degree view.
- **Purpose:** Allows the owner to see immediate cash-in-hand, revenue vs. expenses, and true profit margins without performing manual mathematics.

### 2. Multi-Agent AI Advisory Board ("Dukan Ka Dimaag")
This is the heart of ANTARYA. Instead of a generic chatbot, we deployed three specialized AI agents that read your isolated shop database:
- 📈 **Finance Minister:** Evaluates month-to-date revenue against operations costs to forecast cash flow. Actively targets the highest "Udhaar" (debt) accounts and prescribes collection strategies.
- 📣 **Marketing Guru:** Scans the `customers` database for "inactive" buyers (14+ days no visit) and cross-references them with top-selling products to automatically generate localized WhatsApp retention campaigns.
- 📦 **Operations Manager:** Scans the `products` table to identify "Dead Stock" (items with 0 turnover) and "Low Stock" items, advising on what to liquidate and what to restock immediately.

### 3. Smart POS & Udhaar CRM
- **Mechanism:** A high-speed Point of Sale system tightly integrated with a custom CRM.
- **Purpose:** Supports Cash, UPI, and Udhaar (Credit). It automatically updates the shop's ledger, adjusts inventory counts, and tracks individual customer debt profiles to ensure shopkeepers never forget who owes them money.

### 4. Computer Vision Bill Extraction
- **Mechanism:** Allows users to upload or snap photos of wholesale purchase receipts. The image is converted to Base64, passed to the backend, and fed into Google Gemini Vision models with a strict JSON-schema prompt.
- **Purpose:** Automates inventory data entry. It parses messy, unstructured physical receipts into clean, structured DB items (Name, Price, Quantity).

---

## 🛡️ Innovative Resiliency Features (Our "Bulletproof" Design)

A key highlight of ANTARYA is its **Resiliency Engine**. Small shops often suffer from dropped internet or hit API rate-limits on free tiers. We engineered ANTARYA to never crash when cloud systems fail.

> [!IMPORTANT]
> **Graceful AI Fallbacks**  
> If the Google Gemini API reaches its daily quota limits (HTTP 429), the server intercepts the fatal error before it crashes the app. 
> Instead, it seamlessly injects highly accurate **"Offline Mode" dummy data** into the UI. The user sees helpful pre-written advice and demo catalog items instead of a broken screen.

> [!TIP]
> **In-Memory Database Auto-Mounting**  
> If the backend detects that MongoDB Atlas is unreachable (due to firewalls, IP blocks, or timeouts), it automatically spawns an ephemeral **Local In-Memory MongoDB Server** (`mongodb-memory-server`) under the hood in less than 30 seconds. The backend hooks into it instantly, allowing the app to launch and function perfectly for demo and development purposes without manual database configuration.

---

## 🛠️ Technology Stack Detail

| Layer | Technology | Purpose & Why We Chose It |
| :--- | :--- | :--- |
| **Frontend Core** | React.js + Vite | Lightning-fast HMR and minimal bundle footprint for weak mobile internet speeds. |
| **Styling** | Vanilla CSS + CSS Variables | Created a custom "Bharat Premium" aesthetic (Glassmorphism, fluid dark mode) without the bloat of massive UI libraries. |
| **Backend Core** | Node.js + Express.js | Non-blocking asynchronous I/O is perfect for handling simultaneous AI-generation requests and POS events. |
| **Database** | MongoDB Atlas / Local | Document-based (NoSQL) flexibility is ideal for dynamic product schemas and unstructured AI contexts. |
| **Authentication**| JSON Web Tokens (JWT) | Stateless authentication ensures secure access to AI and financial data without requiring heavy session stores. |
| **AI LLM** | Google Gemini 2.5 Flash | Provides the absolute fastest time-to-first-token for chat responses, and boasts superior native parsing for Hindi/English mixes. |
| **Speech SDK** | Bhashini API | Government of India's ASR system, offering unparalleled accuracy for native Indian accents compared to Western voice models. |

---

## 💻 Setup & Installation

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas Account (or completely rely on our auto-fallback)
- Google Gemini API Key

### Quick Start

1. **Clone the Repo**
   ```bash
   git clone https://github.com/Arjundas08/antarya.git
   cd antarya
   ```

2. **Initialize Backend**
   ```bash
   cd server
   npm install
   ```
   *Create `.env` inside `server`:*
   ```env
   PORT=5001
   MONGO_URI=your_mongodb_atlas_uri
   GEMINI_API_KEY=your_gemini_api_key
   JWT_SECRET=your_secret_key
   ```

3. **Initialize Frontend**
   ```bash
   cd ../client
   npm install
   ```

4. **Launch the Ecosystem**
   Return to the root directory and run the concurrent startup script:
   ```bash
   npm run dev
   ```

> [!NOTE]
> Upon running `npm run dev`, if your IP is not whitelisted on MongoDB Atlas, the command line will hang for exactly 30 seconds. Do not intervene. The system will automatically spawn the internal memory-server and boot successfully.

---
**Built with ❤️ for the Indian Merchant Ecosystem. We don't just build software; we build internal strength (*Antarya*).**
