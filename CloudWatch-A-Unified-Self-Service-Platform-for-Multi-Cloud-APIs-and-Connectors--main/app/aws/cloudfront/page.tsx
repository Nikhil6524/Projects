'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Upload, Globe, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { uploadWebsite, enableStaticWebsite, createCloudFrontDistribution } from '@/lib/api'
import JSZip from 'jszip'
import { Progress } from "@/components/ui/progress"

declare module 'react' {
  interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
    webkitdirectory?: string;
    directory?: string;
  }
}

interface JSZipMetadata {
  percent: number;
  currentFile: string;
}

export default function CloudFrontPage() {
  const [buckets, setBuckets] = useState<Array<{ name: string, creation_date: string }>>([])
  const [selectedFolder, setSelectedFolder] = useState<FileList | null>(null)
  const [selectedBucket, setSelectedBucket] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [distributionUrl, setDistributionUrl] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState<string>('')
  const [isDeploying, setIsDeploying] = useState(false)
  const [deploymentStatus, setDeploymentStatus] = useState<'idle' | 'deploying' | 'checking' | 'ready'>('idle')

  useEffect(() => {
    const fetchBuckets = async () => {
      try {
        const response = await fetch('http://localhost:5000/s3/list_buckets')
        const data = await response.json()
        if (data.buckets) {
          setBuckets(data.buckets)
        }
      } catch (error) {
        console.error('Failed to fetch buckets:', error)
        toast.error('Failed to fetch buckets')
      }
    }

    fetchBuckets()
  }, [])

  const handleFolderSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      const fileList = Array.from(files)
      if (fileList.every(file => 'webkitRelativePath' in file)) {
        setSelectedFolder(files)
      }
    }
  }

  const checkDistributionStatus = async (distributionDomain: string) => {
    try {
      setDeploymentStatus('checking')
      const response = await fetch(`https://${distributionDomain}`)
      if (response.ok) {
        setDeploymentStatus('ready')
      } else {
        // If not ready, check again in 30 seconds
        setTimeout(() => checkDistributionStatus(distributionDomain), 30000)
      }
    } catch (error) {
      // If there's an error (distribution not ready), check again in 30 seconds
      setTimeout(() => checkDistributionStatus(distributionDomain), 30000)
    }
  }

  const handleDeploy = async () => {
    if (!selectedFolder || !selectedBucket) return

    setIsUploading(true)
    setIsDeploying(true)
    setDeploymentStatus('deploying')
    setUploadProgress(0)
    try {
      // Create a zip file from the selected folder
      setCurrentStep('Creating zip file...')
      const zip = new JSZip()
      const totalFiles = selectedFolder.length
      let processedFiles = 0
      
      for (let i = 0; i < selectedFolder.length; i++) {
        const file = selectedFolder[i]
        zip.file(file.webkitRelativePath, file)
        processedFiles++
        setUploadProgress((processedFiles / (totalFiles * 2)) * 100)
      }

      const content = await zip.generateAsync({ 
        type: 'blob',
        onProgress: (metadata: JSZipMetadata) => {
          setUploadProgress(50 + (metadata.percent / 2))
        }
      } as any) as Blob
      const zipFile = new File([content], 'website.zip')

      // Upload website files
      setCurrentStep('Uploading files...')
      await uploadWebsite(selectedBucket, zipFile)
      setUploadProgress(75)
      toast.success('Website files uploaded successfully')

      // Enable static website hosting
      setCurrentStep('Enabling static website hosting...')
      const { website_url } = await enableStaticWebsite(selectedBucket)
      setUploadProgress(85)
      toast.success('Static website hosting enabled')

      // Create CloudFront distribution
      setCurrentStep('Creating CloudFront distribution...')
      const { distribution_domain } = await createCloudFrontDistribution(selectedBucket)
      setDistributionUrl(distribution_domain)
      setUploadProgress(100)
      toast.success('CloudFront distribution created')

      // Start checking distribution status
      checkDistributionStatus(distribution_domain)

    } catch (error) {
      console.error('Failed to deploy website:', error)
      toast.error('Failed to deploy website. Please try again.')
      setDeploymentStatus('idle')
    } finally {
      setIsUploading(false)
      setCurrentStep('')
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
      </div>

      <h1 className="text-3xl font-bold mb-6">Deploy Static Website</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Website Deployment</CardTitle>
            <CardDescription>
              Upload your website files and deploy them using CloudFront
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Select Bucket</Label>
                <Select onValueChange={setSelectedBucket} value={selectedBucket}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a bucket" />
                  </SelectTrigger>
                  <SelectContent>
                    {buckets.map(bucket => (
                      <SelectItem key={bucket.name} value={bucket.name}>
                        {bucket.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Website Files</Label>
                <Input
                  type="file"
                  // @ts-ignore - these attributes exist but aren't in the type definitions
                  webkitdirectory=""
                  directory=""
                  multiple
                  onChange={handleFolderSelect}
                  className="cursor-pointer"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Select the folder containing your website files
                </p>
              </div>

              {isUploading && (
                <div className="space-y-2">
                  <Progress value={uploadProgress} />
                  <p className="text-sm text-muted-foreground text-center">
                    {currentStep}
                  </p>
                </div>
              )}

              <Button
                className="w-full"
                disabled={!selectedFolder || !selectedBucket || isUploading}
                onClick={handleDeploy}
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Deploying...
                  </>
                ) : (
                  <>
                    <Globe className="mr-2 h-4 w-4" />
                    Deploy Website
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {distributionUrl && (
          <Card>
            <CardHeader>
              <CardTitle>
                {deploymentStatus === 'ready' ? 'Deployment Success!' : 'Deploying Website...'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>Your website will be available at:</p>
                <a
                  href={`https://${distributionUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline break-all"
                >
                  https://{distributionUrl}
                </a>
                <p className="text-sm text-muted-foreground">
                  {deploymentStatus === 'ready' 
                    ? 'Your website is now live!'
                    : 'Please wait while CloudFront sets up your distribution. This typically takes 5-10 minutes.'}
                </p>
                {deploymentStatus !== 'ready' && (
                  <div className="mt-4">
                    <Progress value={uploadProgress} className="mb-2" />
                    <p className="text-sm text-center text-muted-foreground">
                      {currentStep || 'Waiting for CloudFront distribution...'}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 