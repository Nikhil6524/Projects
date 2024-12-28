'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { BackButton } from "@/components/back-button"
import Link from 'next/link'

export default function GCPPage() {
  const [useVisionAI, setUseVisionAI] = useState(false)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <BackButton />
        <img 
          src="/gcp.png" 
          alt="GCP Logo" 
          className="h-12 w-12"
        />
      </div>
      <h2 className="text-2xl font-bold text-gray-900">Google Cloud Platform Services</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <Card className="border-[#4285F4]/20 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="text-[#4285F4]">Cloud Storage</CardTitle>
            <CardDescription>Manage your GCP Cloud Storage</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">3 buckets</p>
          </CardContent>
          <CardFooter>
            <Button className="bg-[#4285F4] hover:bg-[#4285F4]/90">Create New Bucket</Button>
          </CardFooter>
        </Card>

        <Card className="border-[#4285F4]/20 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="text-[#4285F4]">Compute Engine</CardTitle>
            <CardDescription>Manage your GCP Compute Engine instances</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">5 active instances</p>
          </CardContent>
          <CardFooter>
            <Button className="bg-[#4285F4] hover:bg-[#4285F4]/90">Create New Instance</Button>
          </CardFooter>
        </Card>

        <Card className="border-[#4285F4]/20 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="text-[#4285F4]">Cloud CDN</CardTitle>
            <CardDescription>Manage your Google Cloud CDN</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">2 active configurations</p>
          </CardContent>
          <CardFooter>
            <Button className="bg-[#4285F4] hover:bg-[#4285F4]/90">Add New CDN Configuration</Button>
          </CardFooter>
        </Card>

        <Card className="border-[#4285F4]/20 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="text-[#4285F4]">Vision AI</CardTitle>
            <CardDescription>Enable or disable Google Cloud Vision AI</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Switch
                id="vision-ai"
                checked={useVisionAI}
                onCheckedChange={setUseVisionAI}
              />
              <label htmlFor="vision-ai" className="text-lg">
                Do you want to use Google Cloud Vision AI?
              </label>
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-gray-500">
              {useVisionAI ? "Google Cloud Vision AI is enabled." : "Google Cloud Vision AI is disabled."}
            </p>
          </CardFooter>
        </Card>

        <Card className="border-[#4285F4]/20 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="text-[#4285F4]">Cloud Monitoring</CardTitle>
            <CardDescription>Monitor your GCP resources and applications</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">12 active alerts</p>
          </CardContent>
          <CardFooter>
            <Button className="bg-[#4285F4] hover:bg-[#4285F4]/90">Show Statistics</Button>
          </CardFooter>
        </Card>

        <Card className="border-[#4285F4]/20 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="text-[#4285F4]">Add More Tools</CardTitle>
            <CardDescription>Explore additional GCP services</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/gcp/more-tools" passHref>
              <Button className="bg-[#4285F4] hover:bg-[#4285F4]/90 w-full">
                Explore More GCP Tools
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

