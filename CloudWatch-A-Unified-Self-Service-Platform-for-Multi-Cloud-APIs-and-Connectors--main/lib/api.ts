const API_BASE_URL = 'http://localhost:5000';

export async function listS3Buckets() {
  const response = await fetch(`${API_BASE_URL}/s3/list_buckets`);
  if (!response.ok) {
    throw new Error('Failed to fetch buckets');
  }
  return response.json();
}

export async function getBucketInfo(bucketName: string) {
  const response = await fetch(`${API_BASE_URL}/s3/bucket_info?bucket_name=${bucketName}`);
  if (!response.ok) {
    throw new Error('Failed to fetch bucket info');
  }
  return response.json();
}

export async function listBucketObjects(bucketName: string) {
  const response = await fetch(`${API_BASE_URL}/s3/list_objects?bucket_name=${bucketName}`);
  if (!response.ok) {
    throw new Error('Failed to fetch bucket objects');
  }
  return response.json();
}

export async function createS3Bucket(bucketName: string, region: string = 'us-east-1') {
  const response = await fetch(`${API_BASE_URL}/s3/create_bucket`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ bucket_name: bucketName, region }),
  });
  if (!response.ok) {
    throw new Error('Failed to create bucket');
  }
  return response.json();
}

export async function deleteS3Bucket(bucketName: string) {
  const response = await fetch(`${API_BASE_URL}/s3/delete_bucket`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ bucket_name: bucketName }),
  });
  if (!response.ok) {
    throw new Error('Failed to delete bucket');
  }
  return response.json();
}

export async function uploadFileToS3(bucketName: string, file: File) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('bucket_name', bucketName);

  try {
    const response = await fetch(`${API_BASE_URL}/s3/upload`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to upload file');
    }

    return data;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
}

export async function listEC2Instances() {
  const response = await fetch(`${API_BASE_URL}/describe_instances`);
  if (!response.ok) {
    throw new Error('Failed to fetch instances');
  }
  return response.json();
}

export async function createEC2Instance(params: {
  instanceName: string;
  instanceType: string;
  imageId?: string;
  keyName?: string;
}) {
  const response = await fetch(`${API_BASE_URL}/create_instance`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      InstanceType: params.instanceType,
      ImageId: params.imageId || 'ami-063d43db0594b521b', // Default Amazon Linux 2 AMI
      KeyName: params.keyName || 'Code_test'
    }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create instance');
  }
  return response.json();
}

export async function startEC2Instance(instanceId: string) {
  const response = await fetch(`${API_BASE_URL}/start_instance`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ InstanceId: instanceId }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to start instance');
  }
  return response.json();
}

export async function stopEC2Instance(instanceId: string) {
  const response = await fetch(`${API_BASE_URL}/stop_instance`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ InstanceId: instanceId }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to stop instance');
  }
  return response.json();
}

export async function terminateEC2Instance(instanceId: string) {
  const response = await fetch(`${API_BASE_URL}/terminate_instance`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ InstanceId: instanceId }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to terminate instance');
  }
  return response.json();
}

export async function monitorEC2Instance(instanceId: string) {
  const response = await fetch(`${API_BASE_URL}/monitor_instance`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ InstanceId: instanceId }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to enable monitoring');
  }
  return response.json();
}

export async function analyzeImage(file: File) {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`${API_BASE_URL}/analyze`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to analyze image');
  }

  return response.json();
}

export async function uploadWebsite(bucketName: string, zipFile: File) {
  const formData = new FormData();
  formData.append('website', zipFile);
  formData.append('bucket_name', bucketName);

  const response = await fetch(`${API_BASE_URL}/s3/upload_website`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to upload website');
  }

  return response.json();
}

export async function enableStaticWebsite(bucketName: string) {
  const response = await fetch(`${API_BASE_URL}/s3/enable_static_website`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ bucket_name: bucketName }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to enable static website hosting');
  }

  return response.json();
}

export async function createCloudFrontDistribution(bucketName: string) {
  const response = await fetch(`${API_BASE_URL}/cloudfront/create_distribution_for_website`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ bucket_name: bucketName }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create CloudFront distribution');
  }

  return response.json();
}

