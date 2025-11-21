"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

export default function Header() {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm backdrop-blur-sm">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <Link 
            href="/" 
            className="text-lg font-bold text-blue-700 hover:text-blue-800 truncate max-w-[150px] sm:max-w-[200px] md:max-w-none sm:text-xl md:text-2xl transition-colors"
          >
            PUBLISHER'S PLATFORM
          </Link>
        </div>

        {/* Desktop Navigation - Hidden on mobile, visible from md up */}
        <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
          <Link
            href="/"
            className="text-sm font-medium text-blue-700 hover:text-blue-800 transition-colors"
          >
            Home
          </Link>
          <Link
            href="/tags"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            Tags
          </Link>
          <Link
            href="/search"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            Search
          </Link>

          {session ? (
            <>
              <Link
                href="/blog"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                Blog
              </Link>
              <Link
                href="/editor"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                Write
              </Link>
              <Link
                href={`/profile/${session.user?.id}`}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                Profile
              </Link>
              <button
                onClick={() => signOut()}
                className="rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:from-blue-700 hover:to-indigo-700 lg:px-4 lg:py-2 transition-all shadow-sm"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/signin"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:from-blue-700 hover:to-indigo-700 lg:px-4 lg:py-2 transition-all shadow-sm"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button - Hidden from md up */}
        <button
          className="flex md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {isMenuOpen ? (
              <path d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile menu - Hidden from md up */}
      {isMenuOpen && (
        <div className="border-t border-blue-100 bg-white md:hidden">
          <div className="space-y-1 px-4 py-3">
            <Link
              href="/"
              className="block rounded-md px-3 py-2 text-base font-medium text-blue-700 hover:bg-blue-50 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/tags"
              className="block rounded-md px-3 py-2 text-base font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Tags
            </Link>
            <Link
              href="/search"
              className="block rounded-md px-3 py-2 text-base font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Search
            </Link>
            {session ? (
              <>
                <Link
                  href="/blog"
                  className="block rounded-md px-3 py-2 text-base font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Blog
                </Link>
                <Link
                  href="/editor"
                  className="block rounded-md px-3 py-2 text-base font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Write
                </Link>
                <Link
                  href={`/profile/${session.user?.id}`}
                  className="block rounded-md px-3 py-2 text-base font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    signOut();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full rounded-md px-3 py-2 text-left text-base font-medium text-blue-700 hover:bg-blue-50 transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  className="block rounded-md px-3 py-2 text-base font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="block rounded-md px-3 py-2 text-base font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

