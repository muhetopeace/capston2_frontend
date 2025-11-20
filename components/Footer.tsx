import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-indigo-100 bg-gradient-to-r from-indigo-50 to-blue-50 w-full  left-0">
      <div className="mx-auto max-w-7xl px-4  sm:px-4 lg:px-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          <div>
            <h3 className="text-lg font-bold text-blue-700">publisher-platform</h3>
            <p className="mt-1 text-sm text-indigo-600">
              A platform for sharing ideas and stories.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-blue-700">Product</h4>
            <ul className="mt-2 space-y-1">
              <li>
                <Link
                  href="/"
                  className="text-sm text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/tags"
                  className="text-sm text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  Tags
                </Link>
              </li>
              <li>
                <Link
                  href="/search"
                  className="text-sm text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  Search
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-blue-700">Company</h4>
            <ul className="mt-2 space-y-1">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-blue-700">Legal</h4>
            <ul className="mt-2 space-y-1">
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  Privacy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-4 border-t border-indigo-100 pt-4">
          <p className="text-center text-sm text-indigo-600">
            © {new Date().getFullYear()} publisher-platform. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

