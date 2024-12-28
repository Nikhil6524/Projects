import Link from 'next/link'
import { UserNav } from '@/components/user-nav'
// import { SidebarTrigger } from "@/components/ui/sidebar"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-blue-800 bg-blue-950 shadow-md">
      <div className="container flex h-16 items-center px-4">
        
        <Link href="/" className="flex items-center space-x-2 ml-4">
          <CloudIcon className="h-6 w-6 text-blue-400" />
          <span className="font-bold text-xl text-blue-100">CloudConnect</span>
        </Link>
        <nav className="flex items-center space-x-6 text-sm font-medium ml-6">
          <Link href="/dashboard" className="text-blue-200 transition-colors hover:text-blue-100">Dashboard</Link>
          <Link href="/resources" className="text-blue-200 transition-colors hover:text-blue-100">Resources</Link>
          <Link href="/billing" className="text-blue-200 transition-colors hover:text-blue-100">Billing</Link>
          <Link href="/support" className="text-blue-200 transition-colors hover:text-blue-100">Support</Link>
        </nav>
        <div className="ml-auto flex items-center space-x-4">
          <UserNav />
        </div>
      </div>
    </header>
  )
}

function CloudIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
    </svg>
  )
}

