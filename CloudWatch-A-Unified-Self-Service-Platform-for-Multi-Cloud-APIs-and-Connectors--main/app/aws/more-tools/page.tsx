'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BackButton } from "@/components/back-button"

const awsTools = [
  { name: "AWS Lambda", description: "Run code without thinking about servers" },
  { name: "Amazon RDS", description: "Managed relational database service" },
  { name: "AWS Elastic Beanstalk", description: "Deploy and scale web applications" },
  { name: "Amazon SQS", description: "Fully managed message queuing service" },
  { name: "Amazon SNS", description: "Fully managed pub/sub messaging service" },
  { name: "AWS Glue", description: "Prepare and load data for analytics" },
  { name: "Amazon Redshift", description: "Fast, simple, cost-effective data warehousing" },
  { name: "AWS Step Functions", description: "Visual workflow for distributed applications" },
  { name: "Amazon Kinesis", description: "Process real-time streaming data" },
  { name: "AWS Fargate", description: "Run containers without managing servers" }
]

export default function AWSMoreToolsPage() {
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
          alt="AWS Logo" 
          className="h-12 w-12"
        />
      </div>
      <h2 className="text-2xl font-bold text-gray-900">Additional AWS Tools</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {awsTools.map((tool) => (
          <Card key={tool.name} className="border-[#FF9900]/20 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="text-[#FF9900]">{tool.name}</CardTitle>
              <CardDescription>{tool.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className={`bg-[#FF9900] hover:bg-[#FF9900]/90 w-full ${selectedTool === tool.name ? 'opacity-50' : ''}`}
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

