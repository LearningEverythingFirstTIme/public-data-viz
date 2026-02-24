'use client';

import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Globe, TrendingUp, Users, DollarSign, Loader2 } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const featuredDashboards = [
  {
    id: 'global-economy',
    name: 'Global Economic Indicators',
    description: 'Key economic metrics from around the world including GDP, inflation, and unemployment rates.',
    author: 'DataLens Team',
    widgets: 8,
    category: 'Economic',
    icon: Globe,
  },
  {
    id: 'crypto-tracker',
    name: 'Cryptocurrency Tracker',
    description: 'Real-time cryptocurrency prices and market trends for Bitcoin, Ethereum, and more.',
    author: 'Crypto Analyst',
    widgets: 6,
    category: 'Crypto',
    icon: DollarSign,
  },
  {
    id: 'us-markets',
    name: 'US Markets Overview',
    description: 'Comprehensive view of US stock markets, federal rates, and economic indicators.',
    author: 'Market Watch',
    widgets: 10,
    category: 'Financial',
    icon: TrendingUp,
  },
  {
    id: 'population-insights',
    name: 'Population Insights',
    description: 'Demographic data and population trends from the World Bank database.',
    author: 'Demographics Pro',
    widgets: 5,
    category: 'Demographic',
    icon: Users,
  },
];

const categories = ['All', 'Economic', 'Crypto', 'Financial', 'Demographic'];

function ExploreContent() {
  const router = useRouter();
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#0A0C10] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#00D4AA] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0C10]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero */}
        <div className="text-center py-12">
          <h1 className="text-4xl font-bold text-white mb-4">Explore Dashboards</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Discover public dashboards created by the community. Get inspired and create your own.
          </p>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((category) => (
            <Button
              key={category}
              variant="outline"
              className="border-[#1E2330] text-gray-300 hover:bg-[#1E2330] hover:text-white"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Featured Dashboards */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Featured Dashboards</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredDashboards.map((dashboard) => (
              <Card
                key={dashboard.id}
                className="bg-[#13161E] border-[#1E2330] hover:border-[#00D4AA]/50 transition-colors group cursor-pointer"
                onClick={() => router.push(`/dashboard/${dashboard.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-[#1E2330] flex items-center justify-center group-hover:bg-[#00D4AA]/10 transition-colors">
                      <dashboard.icon className="w-6 h-6 text-[#00D4AA]" />
                    </div>
                    <Badge variant="secondary" className="bg-[#1E2330] text-gray-400">
                      {dashboard.category}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg font-semibold text-white group-hover:text-[#00D4AA] transition-colors">
                    {dashboard.name}
                  </CardTitle>
                  <CardDescription className="text-gray-400 mt-2 line-clamp-2">
                    {dashboard.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">By {dashboard.author}</span>
                    <span className="text-gray-500">{dashboard.widgets} widgets</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-[#00D4AA]/10 to-[#F5A623]/10 rounded-2xl p-8 text-center border border-[#1E2330]">
          <h2 className="text-2xl font-bold text-white mb-4">Create Your Own Dashboard</h2>
          <p className="text-gray-400 max-w-xl mx-auto mb-6">
            Start visualizing your data with our powerful dashboard builder. Connect to multiple data sources and create beautiful charts.
          </p>
          <Button
            onClick={() => router.push(user ? '/dashboard' : '/signup')}
            className="bg-[#00D4AA] text-[#0A0C10] hover:bg-[#00D4AA]/90"
          >
            {user ? 'Go to My Dashboards' : 'Get Started Free'}
          </Button>
        </div>
      </main>
    </div>
  );
}

export default function ExplorePage() {
  // Check if Clerk is configured
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const isClerkConfigured = publishableKey && !publishableKey.includes('dummy');

  if (!isClerkConfigured) {
    const router = useRouter();
    
    return (
      <div className="min-h-screen bg-[#0A0C10]">
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero */}
          <div className="text-center py-12">
            <h1 className="text-4xl font-bold text-white mb-4">Explore Dashboards</h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Discover public dashboards created by the community. Get inspired and create your own.
            </p>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {categories.map((category) => (
              <Button
                key={category}
                variant="outline"
                className="border-[#1E2330] text-gray-300 hover:bg-[#1E2330] hover:text-white"
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Featured Dashboards */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">Featured Dashboards</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredDashboards.map((dashboard) => (
                <Card
                  key={dashboard.id}
                  className="bg-[#13161E] border-[#1E2330] hover:border-[#00D4AA]/50 transition-colors group cursor-pointer"
                  onClick={() => router.push(`/dashboard/${dashboard.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-[#1E2330] flex items-center justify-center group-hover:bg-[#00D4AA]/10 transition-colors">
                        <dashboard.icon className="w-6 h-6 text-[#00D4AA]" />
                      </div>
                      <Badge variant="secondary" className="bg-[#1E2330] text-gray-400">
                        {dashboard.category}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg font-semibold text-white group-hover:text-[#00D4AA] transition-colors">
                      {dashboard.name}
                    </CardTitle>
                    <CardDescription className="text-gray-400 mt-2 line-clamp-2">
                      {dashboard.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">By {dashboard.author}</span>
                      <span className="text-gray-500">{dashboard.widgets} widgets</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-[#00D4AA]/10 to-[#F5A623]/10 rounded-2xl p-8 text-center border border-[#1E2330]">
            <h2 className="text-2xl font-bold text-white mb-4">Create Your Own Dashboard</h2>
            <p className="text-gray-400 max-w-xl mx-auto mb-6">
              Start visualizing your data with our powerful dashboard builder. Connect to multiple data sources and create beautiful charts.
            </p>
            <Button
              onClick={() => router.push('/login')}
              className="bg-[#00D4AA] text-[#0A0C10] hover:bg-[#00D4AA]/90"
            >
              Get Started Free
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return <ExploreContent />;
}
