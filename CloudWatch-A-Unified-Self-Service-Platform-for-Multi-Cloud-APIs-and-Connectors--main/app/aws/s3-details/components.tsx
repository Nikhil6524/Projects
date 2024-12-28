import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Upload, Download, Lock, Unlock, FileIcon, Trash2 } from 'lucide-react'
import { getBucketInfo, listBucketObjects } from '@/lib/api'

interface Bucket {
  name: string
  creation_date: string
}

export const OverviewTab: React.FC<{ buckets: any[], isLoading: boolean }> = ({ buckets, isLoading }) => {
  const [totalSize, setTotalSize] = useState(0);
  const [bucketSizes, setBucketSizes] = useState<{[key: string]: number}>({});
  const [totalObjects, setTotalObjects] = useState(0);
  const [bucketObjects, setBucketObjects] = useState<{[key: string]: number}>({});
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false);

  useEffect(() => {
    const fetchBucketInfo = async () => {
      if (!buckets.length) return;
      
      setIsLoadingMetrics(true);
      let totalSizeTemp = 0;
      let totalObjectsTemp = 0;
      const sizesTemp: {[key: string]: number} = {};
      const objectsTemp: {[key: string]: number} = {};

      try {
        await Promise.all(buckets.map(async (bucket) => {
          try {
            const info = await getBucketInfo(bucket.name);
            totalSizeTemp += info.size;
            totalObjectsTemp += info.objects;
            sizesTemp[bucket.name] = info.size;
            objectsTemp[bucket.name] = info.objects;
          } catch (error) {
            console.error(`Failed to fetch info for bucket ${bucket.name}:`, error);
            sizesTemp[bucket.name] = 0;
            objectsTemp[bucket.name] = 0;
          }
        }));

        setTotalSize(totalSizeTemp);
        setTotalObjects(totalObjectsTemp);
        setBucketSizes(sizesTemp);
        setBucketObjects(objectsTemp);
      } catch (error) {
        console.error('Failed to fetch bucket metrics:', error);
      } finally {
        setIsLoadingMetrics(false);
      }
    };

    if (!isLoading) {
      fetchBucketInfo();
    }
  }, [buckets, isLoading]);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0.00";
    const gigabytes = bytes / (1024 * 1024 * 1024);
    return gigabytes.toFixed(2);
  };

  const calculateCost = (sizeInBytes: number) => {
    const gigabytes = sizeInBytes / (1024 * 1024 * 1024);
    return (gigabytes * 0.023).toFixed(2);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Storage Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingMetrics ? "Loading..." : `${formatSize(totalSize)} GB`}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Objects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalObjects}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estimated Monthly Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${calculateCost(totalSize)}</div>
            <p className="text-xs text-muted-foreground">Based on $0.023 per GB</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Buckets by Size</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {buckets.map((bucket) => {
              const bucketSize = bucketSizes[bucket.name] || 0;
              const percentage = totalSize > 0 ? (bucketSize / totalSize) * 100 : 0;
              
              return (
                <div key={bucket.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{bucket.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Created: {new Date(bucket.creation_date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Objects: {isLoadingMetrics ? "Loading..." : bucketObjects[bucket.name] || 0}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {isLoadingMetrics ? "Loading..." : `${formatSize(bucketSize)} GB`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ${((bucketSize / (1024 * 1024 * 1024)) * 0.023).toFixed(2)} / month
                      </p>
                    </div>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

interface BucketsTabProps {
  buckets: Bucket[]
  isLoading: boolean
  onCreateBucket: (name: string) => void
  onDeleteBucket: (name: string) => void
}

export const BucketsTab: React.FC<BucketsTabProps> = ({ buckets, isLoading, onCreateBucket, onDeleteBucket }) => {
  const [newBucketName, setNewBucketName] = useState('')

  const handleCreateBucket = () => {
    if (newBucketName) {
      onCreateBucket(newBucketName)
      setNewBucketName('')
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Create New Bucket</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input
              placeholder="Enter bucket name"
              value={newBucketName}
              onChange={(e) => setNewBucketName(e.target.value)}
            />
            <Button onClick={handleCreateBucket}>Create</Button>
          </div>
        </CardContent>
      </Card>

      {buckets.map((bucket) => (
        <Card key={bucket.name}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{bucket.name}</span>
              <Button variant="destructive" size="sm" onClick={() => onDeleteBucket(bucket.name)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-sm font-medium">Created</p>
                <p className="text-2xl font-bold">{new Date(bucket.creation_date).toLocaleDateString()}</p>
              </div>
              {/* We'll need to fetch more details for each bucket to display size, files, etc. */}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

interface UploadTabProps {
  buckets: Bucket[]
  selectedBucket: string
  setSelectedBucket: (bucket: string) => void
  uploadedFiles: File[]
  getRootProps: () => any
  getInputProps: () => any
  isDragActive: boolean
  onUpload: (bucketName: string, file: File) => void
  isUploading: boolean
}

export const UploadTab: React.FC<UploadTabProps> = ({
  buckets,
  selectedBucket,
  setSelectedBucket,
  uploadedFiles,
  getRootProps,
  getInputProps,
  isDragActive,
  onUpload,
  isUploading,
}) => (
  <Card>
    <CardHeader>
      <CardTitle>Upload Files</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div>
          <Label htmlFor="bucket-select">Select Bucket</Label>
          <Select onValueChange={setSelectedBucket} value={selectedBucket}>
            <SelectTrigger id="bucket-select">
              <SelectValue placeholder="Select a bucket" />
            </SelectTrigger>
            <SelectContent>
              {buckets.map((bucket) => (
                <SelectItem key={bucket.name} value={bucket.name}>
                  {bucket.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div 
          {...getRootProps()} 
          className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer ${
            isDragActive ? 'border-primary' : 'border-muted-foreground'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            {isDragActive
              ? "Drop the files here ..."
              : "Drag 'n' drop some files here, or click to select files"}
          </p>
        </div>
        {uploadedFiles.length > 0 && (
          <div>
            <h3 className="font-medium mb-2">Selected Files:</h3>
            <ul className="space-y-2">
              {uploadedFiles.map((file, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <FileIcon className="h-4 w-4" />
                  <span>{file.name}</span>
                  <span className="text-sm text-muted-foreground">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <Button 
          disabled={!selectedBucket || uploadedFiles.length === 0 || isUploading} 
          onClick={async () => {
            for (const file of uploadedFiles) {
              try {
                await onUpload(selectedBucket, file);
              } catch (error) {
                console.error(`Failed to upload ${file.name}:`, error);
                // The toast error will be handled by the parent component
                break; // Stop uploading remaining files if one fails
              }
            }
          }}
        >
          <Upload className="mr-2 h-4 w-4" />
          {isUploading ? 'Uploading...' : `Upload to ${selectedBucket || 'selected bucket'}`}
        </Button>
      </div>
    </CardContent>
  </Card>
)

