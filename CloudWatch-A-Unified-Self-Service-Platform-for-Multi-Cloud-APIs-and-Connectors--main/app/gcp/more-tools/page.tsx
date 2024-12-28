'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BackButton } from "@/components/back-button"

const gcpTools = [
  { name: "Cloud Functions", description: "Event-driven serverless compute platform" },
  { name: "Cloud SQL", description: "Fully managed relational database service" },
  { name: "Google Kubernetes Engine (GKE)", description: "Managed, production-ready Kubernetes service" },
  { name: "Cloud Pub/Sub", description: "Ingest events for stream analytics and event-driven computing" },
  { name: "Cloud Tasks", description: "Asynchronous task execution" },
  { name: "Cloud Dataflow", description: "Unified stream and batch data processing" },
  { name: "BigQuery", description: "Fully managed, serverless data warehouse" },
  { name: "Cloud Composer", description: "Fully managed workflow orchestration service" },
  { name: "Cloud Dataproc", description: "Fully managed and highly scalable service for running Apache Spark" },
  { name: "Cloud Run", description: "Fully managed platform for containerized applications" }
]

export default function GCPMoreToolsPage() {
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
          alt="GCP Logo" 
          className="h-12 w-12"
        />
      </div>
      <h2 className="text-2xl font-bold text-gray-900">Additional GCP Tools</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {gcpTools.map((tool) => (
          <Card key={tool.name} className="border-[#4285F4]/20 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="text-[#4285F4]">{tool.name}</CardTitle>
              <CardDescription>{tool.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className={`bg-[#4285F4] hover:bg-[#4285F4]/90 w-full ${selectedTool === tool.name ? 'opacity-50' : ''}`}
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

