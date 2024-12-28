'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useDropzone } from 'react-dropzone'
import { ArrowLeft, Upload, FileIcon, RefreshCw } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { listS3Buckets, getBucketInfo, listBucketObjects, createS3Bucket, deleteS3Bucket, uploadFileToS3 } from '@/lib/api'
import { OverviewTab, BucketsTab, UploadTab } from './components'

export default function S3DetailsPage() {
  const [buckets, setBuckets] = useState<any[]>([])
  const [selectedBucket, setSelectedBucket] = useState('')
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)

  const fetchBuckets = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await listS3Buckets()
      setBuckets(data.buckets)
    } catch (error) {
      console.error('Failed to fetch buckets:', error)
      toast.error("Failed to fetch buckets. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBuckets()
  }, [fetchBuckets])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setUploadedFiles(prev => [...prev, ...acceptedFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  const handleRefresh = () => {
    fetchBuckets()
  }

  const handleCreateBucket = async (bucketName: string) => {
    try {
      await createS3Bucket(bucketName)
      fetchBuckets()
      toast("Bucket created successfully")
    } catch (error) {
      console.error('Failed to create bucket:', error)
      toast.error("Failed to create bucket. Please try again.")
    }
  }

  const handleDeleteBucket = async (bucketName: string) => {
    try {
      await deleteS3Bucket(bucketName)
      fetchBuckets()
      toast("Bucket deleted successfully")
    } catch (error) {
      console.error('Failed to delete bucket:', error)
      toast.error("Failed to delete bucket. Please try again.")
    }
  }

  const handleUpload = async (bucketName: string, file: File) => {
    setIsUploading(true)
    try {
      await uploadFileToS3(bucketName, file)
      toast("File uploaded successfully")
      setUploadedFiles([])
      fetchBuckets() // Refresh the bucket list to show updated sizes
    } catch (error) {
      console.error('Failed to upload file:', error)
      toast.error(`Failed to upload ${file.name}. Please try again.`)
    } finally {
      setIsUploading(false)
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
        <Button onClick={handleRefresh} disabled={isLoading}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <h1 className="text-3xl font-bold mb-6">S3 Storage Details</h1>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="buckets">Buckets</TabsTrigger>
          <TabsTrigger value="upload">Upload</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab buckets={buckets} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="buckets">
          <BucketsTab 
            buckets={buckets} 
            isLoading={isLoading} 
            onCreateBucket={handleCreateBucket}
            onDeleteBucket={handleDeleteBucket}
          />
        </TabsContent>

        <TabsContent value="upload">
          <UploadTab
            buckets={buckets}
            selectedBucket={selectedBucket}
            setSelectedBucket={setSelectedBucket}
            uploadedFiles={uploadedFiles}
            getRootProps={getRootProps}
            getInputProps={getInputProps}
            isDragActive={isDragActive}
            onUpload={handleUpload}
            isUploading={isUploading}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

