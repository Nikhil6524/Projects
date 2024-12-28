'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BackButton } from "@/components/back-button"

const azureTools = [
  { name: "Azure Functions", description: "Execute event-driven serverless code" },
  { name: "Azure SQL Database", description: "Managed, intelligent SQL in the cloud" },
  { name: "Azure Kubernetes Service (AKS)", description: "Simplify Kubernetes management" },
  { name: "Azure Service Bus", description: "Connect across private and public cloud environments" },
  { name: "Azure Event Grid", description: "Get reliable event delivery at massive scale" },
  { name: "Azure Data Factory", description: "Hybrid data integration at enterprise scale" },
  { name: "Azure Synapse Analytics", description: "Limitless analytics service with unmatched time to insight" },
  { name: "Azure Logic Apps", description: "Automate the access and use of data across clouds" },
  { name: "Azure Stream Analytics", description: "Real-time analytics on fast moving streams of data" },
  { name: "Azure Container Instances", description: "Run containers without managing servers" }
]

export default function AzureMoreToolsPage() {
  const [selectedTool, setSelectedTool] = useState<string | null>(null)

  const handleToolClick = (toolName: string) => {
    setSelectedTool(toolName)
    setTimeout(() => {
      alert(`Oops! ${toolName} is not available right now. Please wait for some time :)`)
      setSelectedTool(null)
    }, 500)
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <BackButton />
        <img 
          src="/placeholder.svg?height=48&width=48" 
          alt="Azure Logo" 
          className="h-12 w-12"
        />
      </div>
      <h2 className="text-2xl font-bold text-gray-900">Additional Azure Tools</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {azureTools.map((tool) => (
          <Card key={tool.name} className="border-[#008AD7]/20 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="text-[#008AD7]">{tool.name}</CardTitle>
              <CardDescription>{tool.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className={`bg-[#008AD7] hover:bg-[#008AD7]/90 w-full ${selectedTool === tool.name ? 'opacity-50' : ''}`}
                onClick={() => handleToolClick(tool.name)}
                disabled={selectedTool !== null}
              >
                {selectedTool === tool.name ? 'Selecting...' : 'Select Tool'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

