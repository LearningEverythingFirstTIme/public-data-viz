# DataLens - Public Data Visualization Dashboard

A user-customizable public data visualization dashboard built with Next.js 14, TypeScript, Tailwind CSS, and Vercel.

## Features

### Authentication
- Clerk Authentication with Google Sign-In
- Email/Password authentication
- Protected routes with middleware

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
- **Auth:** Clerk
- **Database:** Vercel Postgres (Neon)
- **Deployment:** Vercel

## Project Structure

```
app/
  (auth)/
    login/page.tsx       # Login page with Clerk
    signup/page.tsx      # Signup page with Clerk
  dashboard/
    page.tsx             # Dashboard list
    [id]/
      page.tsx           # View dashboard
      edit/page.tsx      # Edit dashboard
  explore/page.tsx       # Public dashboards
  api/
    dashboards/          # Dashboard CRUD API
    widgets/             # Widget CRUD API
    data/[source]/       # Data source proxies
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
  db/                    # Database layer
    schema.sql           # PostgreSQL schema
    index.ts             # Database operations
  auth.ts                # Clerk user sync
  hooks/                 # Custom hooks
    useAuth.ts
    useDashboards.ts
  data/                  # Data connectors
    connectors.ts
    worldbank.ts
    fred.ts
    coingecko.ts
    index.ts
middleware.ts            # Clerk route protection
types/
  index.ts               # TypeScript types
```

## Setup Instructions

### 1. Clone and Install

```bash
git clone https://github.com/LearningEverythingFirstTIme/public-data-viz.git
cd public-data-viz
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file:

```env
# Database (Vercel Postgres)
POSTGRES_URL=your_postgres_url
POSTGRES_PRISMA_URL=your_prisma_url
POSTGRES_URL_NON_POOLING=your_non_pooling_url
POSTGRES_USER=your_user
POSTGRES_HOST=your_host
POSTGRES_PASSWORD=your_password
POSTGRES_DATABASE=your_database

# Auth (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Optional: FRED API Key for US economic data
FRED_API_KEY=your_fred_api_key
```

### 3. Set Up Database

1. Create a Vercel Postgres database in your Vercel dashboard
2. Copy the environment variables to `.env.local`
3. Run the schema:

```bash
psql $POSTGRES_URL -f lib/db/schema.sql
```

Or manually execute the SQL in `lib/db/schema.sql` in your database console.

### 4. Set Up Clerk

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Create a new application
3. Enable Google OAuth and Email/Password
4. Copy your Publishable Key and Secret Key to `.env.local`
5. Add your domain to allowed origins

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 6. Build for Production

```bash
npm run build
```

### 7. Deploy to Vercel

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

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Dashboards Table
```sql
CREATE TABLE dashboards (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  layout_json JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Widgets Table
```sql
CREATE TABLE widgets (
  id TEXT PRIMARY KEY,
  dashboard_id TEXT REFERENCES dashboards(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT,
  data_source TEXT NOT NULL,
  params_json JSONB,
  chart_config_json JSONB,
  position_json JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## License

MIT
