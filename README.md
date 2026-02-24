# DataLens - Data Visualization Dashboard

A user-customizable public data visualization dashboard built with Next.js 14, TypeScript, Tailwind CSS, and Firebase.

## Features

### Authentication
- Firebase Authentication with Google Sign-In
- Email/Password authentication
- Protected routes

### Dashboard System
- List view of user's dashboards
- Create, edit, and delete dashboards
- Dashboard builder with drag/resize grid (react-grid-layout)
- Public/private dashboard visibility

### Widget System
- **Chart Types:** Line, Bar, Area, Scatter, Pie, Stat Card
- **Data Sources:**
  - World Bank API (GDP, Population, Economic indicators)
  - FRED (US Federal Reserve Economic Data)
  - CoinGecko (Cryptocurrency prices)

### Widget Customization
- Data source picker with categories
- Chart type selector
- Date range picker
- Color theme picker (5 prebuilt themes: Teal, Amber, Purple, Rose, Cyan)
- Live preview while configuring

### Design
**"Refined Dark Observatory" Theme**
- Background: #0A0C10
- Surfaces: #13161E with #1E2330 borders
- Accent: #00D4AA (teal)
- Secondary: #F5A623 (amber)
- Typography: Syne (headings), IBM Plex Mono (data)

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Charts:** Recharts
- **Grid:** react-grid-layout
- **Auth & Database:** Firebase Auth + Firestore
- **Deployment:** Vercel-ready

## Project Structure

```
app/
  (auth)/
    login/page.tsx       # Login page
    signup/page.tsx      # Signup page
  dashboard/
    page.tsx             # Dashboard list
    [id]/
      page.tsx           # View dashboard
      edit/page.tsx      # Edit dashboard
  explore/page.tsx       # Public dashboards
  api/data/
    [source]/route.ts    # Data API routes
components/
  charts/                # Chart components
    LineChart.tsx
    BarChart.tsx
    AreaChart.tsx
    ScatterChart.tsx
    PieChart.tsx
    StatCard.tsx
  dashboard/             # Dashboard components
    DashboardGrid.tsx
    WidgetFrame.tsx
    WidgetConfigPanel.tsx
  layout/                # Layout components
    Navbar.tsx
lib/
  firebase.ts            # Firebase config
  hooks/                 # Custom hooks
    useAuth.ts
    useDashboards.ts
  data/                  # Data connectors
    connectors.ts
    worldbank.ts
    fred.ts
    coingecko.ts
    index.ts
types/
  index.ts               # TypeScript types
```

## Setup Instructions

### 1. Clone and Install

```bash
cd datalens/my-app
npm install
```

### 2. Configure Firebase

Create a `.env.local` file with your Firebase credentials:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Optional: FRED API Key for US economic data
FRED_API_KEY=your_fred_api_key
```

To get Firebase credentials:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication (Email/Password and Google)
4. Create a Firestore database
5. Get your web app configuration from Project Settings

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Build for Production

```bash
npm run build
```

### 5. Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Make sure to add your environment variables in the Vercel dashboard.

## Data Sources

### World Bank API
Free public API for global economic and demographic data.
- GDP (Current US$)
- GDP Growth Rate
- Total Population
- Population Growth
- Inflation Rate
- Unemployment Rate
- Education Expenditure
- Health Expenditure

### FRED (Federal Reserve Economic Data)
US economic data from the Federal Reserve.
- GDP
- Unemployment Rate
- Consumer Price Index
- Federal Funds Rate
- Treasury Spread
- USD/EUR Exchange Rate
- S&P 500
- M2 Money Supply

**Note:** FRED requires an API key for production use. Without a key, mock data is provided.

### CoinGecko
Cryptocurrency market data.
- Bitcoin (BTC)
- Ethereum (ETH)
- Solana (SOL)
- Cardano (ADA)
- Polkadot (DOT)
- Chainlink (LINK)

## Firestore Database Schema

```
dashboards/
  {dashboardId}/
    userId: string
    name: string
    description: string
    isPublic: boolean
    widgets: WidgetConfig[]
    layout: WidgetLayout[]
    createdAt: timestamp
    updatedAt: timestamp
```

## License

MIT
