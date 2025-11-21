import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-indigo-100 bg-gradient-to-br from-indigo-100 via-white to-blue-100 w-full left-0 shadow-inner py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          <div className="space-y-2">
            <h3 className="text-xl font-extrabold text-blue-700 tracking-tight">publisher's-platform</h3>
            <p className="text-sm text-indigo-700 leading-relaxed">
              A platform for sharing ideas and stories.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-blue-700 uppercase tracking-wide">Product</h4>
            <ul className="mt-2 space-y-1">
              <li>
                <Link
                  href="/"
                  className="text-sm text-indigo-700 hover:text-blue-900 transition-colors duration-200"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/tags"
                  className="text-sm text-indigo-700 hover:text-blue-900 transition-colors duration-200"
                >
                  Tags
                </Link>
              </li>
              <li>
                <Link
                  href="/search"
                  className="text-sm text-indigo-700 hover:text-blue-900 transition-colors duration-200"
                >
                  Search
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-blue-700 uppercase tracking-wide">Company</h4>
            <ul className="mt-2 space-y-1">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-indigo-700 hover:text-blue-900 transition-colors duration-200"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-indigo-700 hover:text-blue-900 transition-colors duration-200"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-blue-700 uppercase tracking-wide">Legal</h4>
            <ul className="mt-2 space-y-1">
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-indigo-700 hover:text-blue-900 transition-colors duration-200"
                >
                  Privacy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-indigo-700 hover:text-blue-900 transition-colors duration-200"
                >
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-indigo-200 pt-4">
          <p className="text-center text-sm text-indigo-700 tracking-wide">
            © {new Date().getFullYear()} publisher-platform. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}


