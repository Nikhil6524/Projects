import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Power, HardDrive, Cpu, MemoryStick } from 'lucide-react'
import { createEC2Instance } from '@/lib/api'
import { toast } from 'sonner'

export const OverviewTab: React.FC<{ instances: any[], isLoading: boolean }> = ({ instances, isLoading }) => {
  const getTotalRunningInstances = () => instances.filter(i => 
    i.State?.Name?.toLowerCase() === 'running' || 
    i.State?.Name?.toLowerCase() === 'pending'
  ).length;
  const getTotalCPUs = () => {
    // t2.micro = 1 vCPU, t2.small = 1 vCPU, t2.medium = 2 vCPU
    return instances.reduce((acc, i) => {
      const cpuCount = i.InstanceType?.includes('medium') ? 2 : 1
      return acc + cpuCount
    }, 0)
  }
  const getTotalMemory = () => {
    // t2.micro = 1GB, t2.small = 2GB, t2.medium = 4GB
    return instances.reduce((acc, i) => {
      let memory = 1 // default for t2.micro
      if (i.InstanceType?.includes('small')) memory = 2
      if (i.InstanceType?.includes('medium')) memory = 4
      return acc + memory
    }, 0)
  }

  const calculateCost = () => {
    return instances.reduce((acc, i) => {
      if (i.State?.Name?.toLowerCase() === 'running' || 
          i.State?.Name?.toLowerCase() === 'pending') {
        let hourlyRate = 0.0116 // default for t2.micro
        if (i.InstanceType?.includes('small')) hourlyRate = 0.023
        if (i.InstanceType?.includes('medium')) hourlyRate = 0.0464
        return acc + (hourlyRate * 24 * 30) // Monthly cost
      }
      return acc
    }, 0).toFixed(2)
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Running Instances</CardTitle>
            <Power className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "Loading..." : getTotalRunningInstances()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total vCPUs</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "Loading..." : getTotalCPUs()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Memory (GB)</CardTitle>
            <MemoryStick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "Loading..." : getTotalMemory()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estimated Monthly Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${isLoading ? "..." : calculateCost()}
            </div>
            <p className="text-xs text-muted-foreground">Based on current usage</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Instance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {instances.map((instance) => (
              <div key={instance.InstanceId} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{instance.InstanceId}</p>
                    <p className="text-sm text-muted-foreground">
                      Type: {instance.InstanceType}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${
                      instance.State?.Name?.toLowerCase() === 'running' ? 'text-green-600' :
                      instance.State?.Name?.toLowerCase() === 'pending' ? 'text-yellow-600' :
                      instance.State?.Name?.toLowerCase() === 'stopping' ? 'text-orange-600' :
                      instance.State?.Name?.toLowerCase() === 'stopped' ? 'text-red-600' :
                      'text-gray-600'
                    }`}>
                      {instance.State?.Name?.toUpperCase() || 'UNKNOWN'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {instance.PublicIpAddress || 'No public IP'}
                    </p>
                  </div>
                </div>
                <Progress 
                  value={
                    instance.State?.Name?.toLowerCase() === 'running' ? 100 :
                    instance.State?.Name?.toLowerCase() === 'pending' ? 75 :
                    instance.State?.Name?.toLowerCase() === 'stopping' ? 25 :
                    instance.State?.Name?.toLowerCase() === 'stopped' ? 0 :
                    0
                  } 
                  className={`h-2 ${
                    instance.State?.Name?.toLowerCase() === 'running' ? 'bg-green-100' :
                    instance.State?.Name?.toLowerCase() === 'pending' ? 'bg-yellow-100' :
                    instance.State?.Name?.toLowerCase() === 'stopping' ? 'bg-orange-100' :
                    'bg-gray-100'
                  }`}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export const InstancesTab: React.FC<{ 
  instances: any[], 
  isLoading: boolean,
  onStartInstance: (id: string) => Promise<void>,
  onStopInstance: (id: string) => Promise<void>,
  onTerminateInstance: (id: string) => Promise<void>
}> = ({ 
  instances, 
  isLoading,
  onStartInstance,
  onStopInstance,
  onTerminateInstance
}) => {
  const getStateColor = (state: string) => {
    switch (state?.toLowerCase()) {
      case 'running': return 'text-green-600'
      case 'pending': return 'text-yellow-600'
      case 'stopping': return 'text-orange-600'
      case 'stopped': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const canStart = (state: string) => ['stopped'].includes(state?.toLowerCase())
  const canStop = (state: string) => ['running', 'pending'].includes(state?.toLowerCase())
  const canTerminate = (state: string) => !['terminated', 'shutting-down'].includes(state?.toLowerCase())

  return (
    <div className="space-y-4">
      {instances.map((instance) => (
        <Card key={instance.InstanceId}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{instance.InstanceId}</span>
              <div className="space-x-2">
                <Button 
                  variant={canStop(instance.State?.Name) ? 'destructive' : 'default'}
                  size="sm"
                  disabled={!canStart(instance.State?.Name) && !canStop(instance.State?.Name)}
                  onClick={() => canStop(instance.State?.Name)
                    ? onStopInstance(instance.InstanceId)
                    : onStartInstance(instance.InstanceId)
                  }
                >
                  {canStop(instance.State?.Name) ? 'Stop' : 'Start'}
                </Button>
                <Button 
                  variant="destructive"
                  size="sm"
                  disabled={!canTerminate(instance.State?.Name)}
                  onClick={() => onTerminateInstance(instance.InstanceId)}
                >
                  Terminate
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-sm font-medium">Instance Type</p>
                <p className="text-2xl font-bold">{instance.InstanceType}</p>
              </div>
              <div>
                <p className="text-sm font-medium">State</p>
                <p className={`text-2xl font-bold ${getStateColor(instance.State?.Name)}`}>
                  {instance.State?.Name}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Public IP</p>
                <p className="text-2xl font-bold">{instance.PublicIpAddress || 'None'}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Private IP</p>
                <p className="text-2xl font-bold">{instance.PrivateIpAddress}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export const LaunchTab: React.FC<{ 
  isLaunching: boolean,
  setIsLaunching: (launching: boolean) => void,
  onRefresh: () => void
}> = ({ isLaunching, setIsLaunching, onRefresh }) => {
  const [instanceName, setInstanceName] = useState('')
  const [instanceType, setInstanceType] = useState('')

  const handleLaunch = async () => {
    setIsLaunching(true)
    try {
      await createEC2Instance({
        instanceName,
        instanceType
      })
      toast.success("Instance launched successfully")
      setInstanceName('')
      setInstanceType('')
      onRefresh() // Refresh the instances list
    } catch (error) {
      console.error('Failed to launch instance:', error)
      toast.error("Failed to launch instance. Please try again.")
    } finally {
      setIsLaunching(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Launch New Instance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="instance-name">Instance Name</Label>
            <Input
              id="instance-name"
              placeholder="Enter instance name"
              value={instanceName}
              onChange={(e) => setInstanceName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="instance-type">Instance Type</Label>
            <Select onValueChange={setInstanceType} value={instanceType}>
              <SelectTrigger id="instance-type">
                <SelectValue placeholder="Select an instance type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="t2.micro">t2.micro (1 vCPU, 1 GB RAM)</SelectItem>
                <SelectItem value="t2.small">t2.small (1 vCPU, 2 GB RAM)</SelectItem>
                <SelectItem value="t2.medium">t2.medium (2 vCPU, 4 GB RAM)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button 
            disabled={!instanceName || !instanceType || isLaunching}
            onClick={handleLaunch}
            className="w-full"
          >
            {isLaunching ? 'Launching...' : 'Launch Instance'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 