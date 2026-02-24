'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser, useClerk } from '@clerk/nextjs';
import {
  LayoutDashboard,
  Compass,
  Plus,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NavbarProps {
  onCreateDashboard?: () => void;
}

function NavbarContent({ onCreateDashboard }: NavbarProps) {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const navItems = [
    { href: '/dashboard', label: 'My Dashboards', icon: LayoutDashboard },
    { href: '/explore', label: 'Explore', icon: Compass },
  ];

  return (
    <nav className="sticky top-0 z-40 w-full bg-[#0A0C10]/80 backdrop-blur-xl border-b border-[#1E2330]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00D4AA] to-[#00B894] flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-[#0A0C10]" />
            </div>
            <span className="text-xl font-bold text-white">DataLens</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <item.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {user && (
              <Button
                onClick={onCreateDashboard}
                className="hidden sm:flex items-center gap-2 bg-[#00D4AA] text-[#0A0C10] hover:bg-[#00D4AA]/90"
              >
                <Plus className="w-4 h-4" />
                New Dashboard
              </Button>
            )}

            {isLoaded ? (
              user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#1E2330] transition-colors">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#F5A623] to-[#E6951A] flex items-center justify-center">
                        <span className="text-sm font-medium text-[#0A0C10]">
                          {user.emailAddresses[0]?.emailAddress?.[0].toUpperCase() || 'U'}
                        </span>
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-56 bg-[#13161E] border-[#1E2330]"
                  >
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium text-white">{user.fullName || user.username || 'User'}</p>
                      <p className="text-xs text-gray-400 truncate">{user.emailAddresses[0]?.emailAddress}</p>
                    </div>
                    <DropdownMenuSeparator className="bg-[#1E2330]" />
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="text-red-400 focus:text-red-400 focus:bg-red-400/10 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/login">
                  <Button className="bg-[#00D4AA] text-[#0A0C10] hover:bg-[#00D4AA]/90">
                    Sign In
                  </Button>
                </Link>
              )
            ) : (
              <Link href="/login">
                <Button className="bg-[#00D4AA] text-[#0A0C10] hover:bg-[#00D4AA]/90">
                  Sign In
                </Button>
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-white"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-[#1E2330]">
            <div className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-[#1E2330] rounded-lg transition-colors"
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              ))}
              {user && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onCreateDashboard?.();
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-[#00D4AA] hover:bg-[#00D4AA]/10 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Dashboard</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export function Navbar({ onCreateDashboard }: NavbarProps) {
  // Check if Clerk is configured
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const isClerkConfigured = publishableKey && !publishableKey.includes('dummy');

  if (!isClerkConfigured) {
    const router = useRouter();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navItems = [
      { href: '/dashboard', label: 'My Dashboards', icon: LayoutDashboard },
      { href: '/explore', label: 'Explore', icon: Compass },
    ];

    return (
      <nav className="sticky top-0 z-40 w-full bg-[#0A0C10]/80 backdrop-blur-xl border-b border-[#1E2330]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00D4AA] to-[#00B894] flex items-center justify-center">
                <LayoutDashboard className="w-5 h-5 text-[#0A0C10]" />
              </div>
              <span className="text-xl font-bold text-white">DataLens</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                  <item.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button className="bg-[#00D4AA] text-[#0A0C10] hover:bg-[#00D4AA]/90">
                  Sign In
                </Button>
              </Link>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-400 hover:text-white"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-[#1E2330]">
              <div className="space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-[#1E2330] rounded-lg transition-colors"
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </nav>
    );
  }

  return <NavbarContent onCreateDashboard={onCreateDashboard} />;
}
