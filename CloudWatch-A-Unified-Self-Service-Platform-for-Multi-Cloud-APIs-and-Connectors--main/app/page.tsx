'use client'

import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { PlusCircle, Cloud } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function Home() {
  const [activeDistributions, setActiveDistributions] = useState<number>(0)

  useEffect(() => {
    const fetchDistributions = async () => {
      try {
        const response = await fetch('http://localhost:5000/cloudfront/list_distributions')
        const data = await response.json()
        if (data.distributions) {
          const active = data.distributions.filter((dist: any) => dist.Status === 'Deployed').length
          setActiveDistributions(active)
        }
      } catch (error) {
        console.error('Failed to fetch distributions:', error)
      }
    }

    fetchDistributions()
  }, [])

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-center text-gray-900">Choose a Cloud Provider</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <Link href="/aws" className="transform hover:scale-105 transition-transform">
          <div className="aspect-square rounded-xl border-2 border-[#FF9900] bg-gradient-to-br from-[#FF9900]/10 to-[#FF9900]/5 p-8 flex flex-col items-center justify-center gap-4 hover:shadow-lg transition-shadow relative">
            <img 
              src="/aws_logo.png" 
              alt="AWS Logo" 
              className="h-16 w-16"
            />
            <span className="text-2xl font-semibold text-[#FF9900]">AWS</span>
            {activeDistributions > 0 && (
              <div className="absolute top-4 right-4 bg-[#FF9900]/10 text-[#FF9900] px-2 py-1 rounded-full text-xs font-medium flex items-center">
                <Cloud className="w-3 h-3 mr-1" />
                {activeDistributions} active
              </div>
            )}
          </div>
        </Link>

        <Link href="/azure" className="transform hover:scale-105 transition-transform">
          <div className="aspect-square rounded-xl border-2 border-[#008AD7] bg-gradient-to-br from-[#008AD7]/10 to-[#008AD7]/5 p-8 flex flex-col items-center justify-center gap-4 hover:shadow-lg transition-shadow">
            <img 
              src="/azure.png" 
              alt="Azure Logo" 
              className="h-16 w-16"
            />
            <span className="text-2xl font-semibold text-[#008AD7]">Azure</span>
          </div>
        </Link>

        <Link href="/gcp" className="transform hover:scale-105 transition-transform">
          <div className="aspect-square rounded-xl border-2 border-[#4285F4] bg-gradient-to-br from-[#4285F4]/10 to-[#4285F4]/5 p-8 flex flex-col items-center justify-center gap-4 hover:shadow-lg transition-shadow">
            <img 
              src="/gcp.png" 
              alt="GCP Logo" 
              className="h-16 w-16"
            />
            <span className="text-2xl font-semibold text-[#4285F4]">GCP</span>
          </div>
        </Link>

        <Link href="/add-more" className="transform hover:scale-105 transition-transform">
          <div className="aspect-square rounded-xl border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-white p-8 flex flex-col items-center justify-center gap-4 hover:shadow-lg transition-shadow">
            <PlusCircle className="h-16 w-16 text-gray-400" />
            <span className="text-2xl font-semibold text-gray-600">Add More</span>
          </div>
        </Link>
      </div>
    </div>
  )
}

