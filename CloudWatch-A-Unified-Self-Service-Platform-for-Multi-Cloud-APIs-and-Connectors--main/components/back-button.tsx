import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { ChevronLeft } from 'lucide-react'

export function BackButton() {
  return (
    <Link href="/" passHref>
      <Button variant="ghost" className="mb-4">
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back to Providers
      </Button>
    </Link>
  )
}

