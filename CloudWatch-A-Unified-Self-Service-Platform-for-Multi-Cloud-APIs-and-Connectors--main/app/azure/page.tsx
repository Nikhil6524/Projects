'use client'

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { BackButton } from "@/components/back-button"
import Link from 'next/link'
import { Metadata } from "next"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarDateRangePicker } from "@/components/date-range-picker"
import { MainNav } from "@/components/main-nav"
import { Overview } from "@/components/overview"
import { RecentSales } from "@/components/recent-sales"
import { Search } from "@/components/search"
import TeamSwitcher from "@/components/team-switcher"
import { UserNav } from "@/components/user-nav"

export const metadata: Metadata = {
  title: "Azure Dashboard",
  description: "Azure Cloud Services Dashboard",
}

export default function AzurePage() {
  const [useCognitiveServices, setUseCognitiveServices] = useState(false)
  const [text, setText] = useState('')
  const [voice, setVoice] = useState('en-IN-NeerjaNeural')
  const [voices, setVoices] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Fetch available voices when component mounts
  useEffect(() => {
    fetch('http://localhost:5001/tts/voices')
      .then(res => res.json())
      .then(data => setVoices(data))
      .catch(err => console.error('Error fetching voices:', err))
  }, [])

  const handleSynthesize = async () => {
    if (!text) return

    setIsLoading(true)
    try {
      const response = await fetch('http://localhost:5001/tts/synthesize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, voice }),
      })

      const data = await response.json()
      
      if (data.success && data.audio) {
        // Create audio from base64
        const audio = `data:audio/wav;base64,${data.audio}`
        if (audioRef.current) {
          audioRef.current.src = audio
          audioRef.current.play()
        }
      } else {
        console.error('Speech synthesis failed:', data.error)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <BackButton />
        <img 
          src="/azure.png" 
          alt="Azure Logo" 
          className="h-12 w-12"
        />
      </div>
      <h2 className="text-2xl font-bold text-gray-900">Azure Services</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <Card className="border-[#008AD7]/20 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="text-[#008AD7]">Blob Storage</CardTitle>
            <CardDescription>Manage your Azure Blob Storage</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">4 storage accounts</p>
          </CardContent>
          <CardFooter>
            <Button className="bg-[#008AD7] hover:bg-[#008AD7]/90">Create New Storage Account</Button>
          </CardFooter>
        </Card>

        <Card className="border-[#008AD7]/20 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="text-[#008AD7]">Virtual Machines</CardTitle>
            <CardDescription>Manage your Azure VMs</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">6 running VMs</p>
          </CardContent>
          <CardFooter>
            <Button className="bg-[#008AD7] hover:bg-[#008AD7]/90">Create New VM</Button>
          </CardFooter>
        </Card>

        <Card className="border-[#008AD7]/20 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="text-[#008AD7]">Azure CDN</CardTitle>
            <CardDescription>Manage your Azure Content Delivery Network</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">1 active profile</p>
          </CardContent>
          <CardFooter>
            <Button className="bg-[#008AD7] hover:bg-[#008AD7]/90">Add New CDN Profile</Button>
          </CardFooter>
        </Card>

        <Card className="border-[#008AD7]/20 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="text-[#008AD7]">Cognitive Services</CardTitle>
            <CardDescription>Enable or disable Azure Cognitive Services</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Switch
                id="cognitive-services"
                checked={useCognitiveServices}
                onCheckedChange={setUseCognitiveServices}
              />
              <label htmlFor="cognitive-services" className="text-lg">
                Do you want to use Azure Cognitive Services?
              </label>
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-gray-500">
              {useCognitiveServices ? "Azure Cognitive Services is enabled." : "Azure Cognitive Services is disabled."}
            </p>
          </CardFooter>
        </Card>

        <Card className="border-[#008AD7]/20 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="text-[#008AD7]">Azure Monitor</CardTitle>
            <CardDescription>Monitor your Azure resources and applications</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">8 active alerts</p>
          </CardContent>
          <CardFooter>
            <Button className="bg-[#008AD7] hover:bg-[#008AD7]/90">Show Statistics</Button>
          </CardFooter>
        </Card>
        <Card className="border-[#008AD7]/20 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="text-[#008AD7]">Add More Tools</CardTitle>
            <CardDescription>Explore additional Azure services</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/azure/more-tools" passHref>
              <Button className="bg-[#008AD7] hover:bg-[#008AD7]/90 w-full">
                Explore More Azure Tools
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
      <Tabs defaultValue="cognitive" className="space-y-4">
        <TabsList>
          <TabsTrigger value="cognitive">Cognitive Services</TabsTrigger>
          <TabsTrigger value="compute">Compute</TabsTrigger>
          <TabsTrigger value="storage">Storage</TabsTrigger>
        </TabsList>
        <TabsContent value="cognitive" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
            <Card>
              <CardHeader>
                <CardTitle>Text to Speech Converter</CardTitle>
                <CardDescription>
                  Convert your text to natural-sounding speech using Azure's Neural Text to Speech service
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Voice Selection</label>
                  <Select value={voice} onValueChange={setVoice}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a voice" />
                    </SelectTrigger>
                    <SelectContent>
                      {voices.map((v: any) => (
                        <SelectItem key={v.name} value={v.name}>
                          {v.language} - {v.gender}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Text Input</label>
                  <Input
                    placeholder="Enter text to convert to speech..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                  />
                </div>
                
                <Button 
                  onClick={handleSynthesize}
                  disabled={!text || isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Converting...' : 'Convert to Speech'}
                </Button>
                
                <audio ref={audioRef} className="w-full mt-4" controls />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="compute" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Add compute-related cards here */}
          </div>
        </TabsContent>
        <TabsContent value="storage" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Add storage-related cards here */}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

