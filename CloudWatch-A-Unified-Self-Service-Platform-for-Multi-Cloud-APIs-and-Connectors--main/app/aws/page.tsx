'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { BackButton } from "@/components/back-button"
import Link from 'next/link'
import { listS3Buckets, listEC2Instances } from '@/lib/api'

interface Bucket {
  name: string
  creation_date: string
}

export default function AWSPage() {
  const [useRekognition, setUseRekognition] = useState(false)
  const [buckets, setBuckets] = useState<Bucket[]>([])
  const [instances, setInstances] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [s3Data, ec2Data] = await Promise.all([
          listS3Buckets(),
          listEC2Instances()
        ])
        setBuckets(s3Data.buckets)
        setInstances(ec2Data)
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()

    // Poll every 10 seconds for EC2 instances
    const interval = setInterval(async () => {
      try {
        const ec2Data = await listEC2Instances()
        setInstances(ec2Data)
      } catch (error) {
        console.error('Failed to update EC2 instances:', error)
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  const getRunningInstances = () => {
    return instances.filter(instance => 
      instance.State?.Name === 'running' || 
      instance.State?.Name === 'pending'
    ).length
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <BackButton />
        <img 
          src="/aws_logo.png" 
          alt="AWS Logo" 
          className="h-12 w-12"
        />
      </div>
      <h2 className="text-2xl font-bold text-gray-900">AWS Services</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <Card className="border-[#FF9900]/20 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="text-[#FF9900]">S3 Services</CardTitle>
            <CardDescription>Manage your S3 instances</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                "Loading..."
              ) : (
                `${buckets.length} Active Bucket${buckets.length !== 1 ? 's' : ''}`
              )}
            </div>
          </CardContent>
          {/* <CardFooter>
            <Button className="bg-[#FF9900] hover:bg-[#FF9900]/90">Create New S3 Instance</Button>
          </CardFooter> */}

          <CardFooter>
            <Link href="/aws/s3-details" passHref>
              <Button className="bg-[#FF9900] hover:bg-[#FF9900]/90 w-full">
                Create New S3 Instances
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="border-[#FF9900]/20 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="text-[#FF9900]">EC2 Instances</CardTitle>
            <CardDescription>Manage your EC2 instances</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                "Loading..."
              ) : (
                <>
                  <div>{getRunningInstances()} Running</div>
                  <div className="text-sm text-muted-foreground">
                    {instances.length} Total Instance{instances.length !== 1 ? 's' : ''}
                  </div>
                </>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/aws/ec2-details" passHref>
              <Button className="bg-[#FF9900] hover:bg-[#FF9900]/90 w-full">
                Manage EC2 Instances
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="border-[#FF9900]/20 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="text-[#FF9900]">CloudFront Services</CardTitle>
            <CardDescription>Manage your CloudFront distributions</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">2 active distributions</p>
          </CardContent>
          <CardFooter>
          <Link href="/aws/cloudfront" passHref>
            <Button className="bg-[#FF9900] hover:bg-[#FF9900]/90">Add New CloudFront Distribution</Button>
          </Link>
          </CardFooter>
          
        </Card>

        <Card className="border-[#FF9900]/20 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="text-[#FF9900]">Amazon Rekognition</CardTitle>
            <CardDescription>Analyze images using AI/ML</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Image Analysis Service
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/aws/rekognition" passHref>
              <Button className="bg-[#FF9900] hover:bg-[#FF9900]/90 w-full">
                Analyze Images
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="border-[#FF9900]/20 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="text-[#FF9900]">CloudWatch</CardTitle>
            <CardDescription>Monitor your AWS resources and applications</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">15 active alarms</p>
          </CardContent>
          <CardFooter>
            <Link href="/aws/cloudwatch" passHref>
              <Button className="bg-[#FF9900] hover:bg-[#FF9900]/90 w-full">
                Show Statistics
              </Button>
            </Link>
          </CardFooter>
        </Card>
        <Card className="border-[#FF9900]/20 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="text-[#FF9900]">Add More Tools</CardTitle>
            <CardDescription>Explore additional AWS services</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/aws/more-tools" passHref>
              <Button className="bg-[#FF9900] hover:bg-[#FF9900]/90 w-full">
                Explore More AWS Tools
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

