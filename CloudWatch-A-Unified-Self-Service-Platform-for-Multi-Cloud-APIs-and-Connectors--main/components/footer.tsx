import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-blue-800 bg-blue-900/95 backdrop-blur supports-[backdrop-filter]:bg-blue-900/75">
      <div className="container flex h-14 items-center">
        <div className="flex-1 text-sm text-blue-300">
          © 2023 CloudConnect. All rights reserved.
        </div>
        <nav className="flex items-center space-x-4 text-sm font-medium">
          <Link href="/about" className="transition-colors hover:text-blue-200">About</Link>
          <Link href="/privacy" className="transition-colors hover:text-blue-200">Privacy Policy</Link>
          <Link href="/terms" className="transition-colors hover:text-blue-200">Terms of Service</Link>
        </nav>
      </div>
    </footer>
  )
}

