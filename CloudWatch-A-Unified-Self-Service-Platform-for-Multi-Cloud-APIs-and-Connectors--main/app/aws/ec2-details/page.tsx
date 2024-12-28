'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Power, RefreshCw } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { listEC2Instances, startEC2Instance, stopEC2Instance, terminateEC2Instance } from '@/lib/api'
import { OverviewTab, InstancesTab, LaunchTab } from './components'

export default function EC2DetailsPage() {
  const [instances, setInstances] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLaunching, setIsLaunching] = useState(false)
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  const fetchInstances = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await listEC2Instances()
      setInstances(data)
    } catch (error) {
      console.error('Failed to fetch instances:', error)
      toast.error("Failed to fetch instances. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchInstances()
    
    // Poll every 5 seconds
    const interval = setInterval(fetchInstances, 5000);
    setPollingInterval(interval);

    // Cleanup on unmount
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [fetchInstances])

  const handleStartInstance = async (instanceId: string) => {
    try {
      await startEC2Instance(instanceId)
      toast.success("Instance start initiated")
      fetchInstances() // Immediate refresh
    } catch (error) {
      console.error('Failed to start instance:', error)
      toast.error("Failed to start instance. Please try again.")
    }
  }

  const handleStopInstance = async (instanceId: string) => {
    try {
      await stopEC2Instance(instanceId)
      toast.success("Instance stopped successfully")
      fetchInstances() // Refresh the list
    } catch (error) {
      console.error('Failed to stop instance:', error)
      toast.error("Failed to stop instance. Please try again.")
    }
  }

  const handleTerminateInstance = async (instanceId: string) => {
    try {
      await terminateEC2Instance(instanceId)
      toast.success("Instance terminated successfully")
      fetchInstances() // Refresh the list
    } catch (error) {
      console.error('Failed to terminate instance:', error)
      toast.error("Failed to terminate instance. Please try again.")
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex justify-between items-center">
        <Link
          href="/aws"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to AWS Services
        </Link>
        <Button onClick={fetchInstances} disabled={isLoading}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <h1 className="text-3xl font-bold mb-6">EC2 Instance Details</h1>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="instances">Instances</TabsTrigger>
          <TabsTrigger value="launch">Launch Instance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab instances={instances} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="instances">
          <InstancesTab 
            instances={instances} 
            isLoading={isLoading}
            onStartInstance={handleStartInstance}
            onStopInstance={handleStopInstance}
            onTerminateInstance={handleTerminateInstance}
          />
        </TabsContent>

        <TabsContent value="launch">
          <LaunchTab
            isLaunching={isLaunching}
            setIsLaunching={setIsLaunching}
            onRefresh={fetchInstances}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
} 