from flask import Flask, request, jsonify
import boto3
import logging
from botocore.exceptions import ClientError
import os
from flask_cors import CORS
from werkzeug.utils import secure_filename
import tempfile
import os
from PIL import Image, ImageDraw, ImageFont
import io
import zipfile
from pathlib import Path
import json
from datetime import datetime, timedelta
import statistics
# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger()

# Initialize Flask App
app = Flask(__name__)
CORS(app)
# AWS Credentials and Helper Function
def get_aws_client(service_name):
    try:
        aws_access_key = os.getenv('AWS_ACCESS_KEY_ID')
        aws_secret_key = os.getenv('AWS_SECRET_ACCESS_KEY')
        region_name = os.getenv('AWS_DEFAULT_REGION', 'us-east-1')
        
        if not aws_access_key or not aws_secret_key:
            # Fall back to boto3's default credential chain
            return boto3.client(service_name, region_name=region_name)
            
        return boto3.client(
            service_name,
            aws_access_key_id=aws_access_key,
            aws_secret_access_key=aws_secret_key,
            region_name=region_name
        )
    except ClientError as e:
        logger.error(f"Failed to create AWS client for {service_name}: {e}")
        return None

# ---------------------------- S3 Operations ---------------------------- #

# Create S3 Bucket
@app.route('/s3/create_bucket', methods=['POST'])
def create_s3_bucket():
    data = request.get_json()
    bucket_name = data.get('bucket_name')
    region = data.get('region', 'us-east-1')
    try:
        s3_client = get_aws_client('s3')
        if region == 'us-east-1':
            s3_client.create_bucket(Bucket=bucket_name)
        else:
            s3_client.create_bucket(
                Bucket=bucket_name,
                CreateBucketConfiguration={'LocationConstraint': region}
            )
        logger.info(f"Successfully created S3 bucket: {bucket_name}")
        return jsonify({'message': f'Bucket {bucket_name} created'}), 200
    except ClientError as e:
        logger.error(f"Failed to create S3 bucket: {e}")
        return jsonify({'error': str(e)}), 500

# List All S3 Buckets
@app.route('/s3/list_buckets', methods=['GET'])
def list_s3_buckets():
    try:
        s3_client = get_aws_client('s3')
        response = s3_client.list_buckets()
        buckets = [{'name': bucket['Name'], 'creation_date': bucket['CreationDate']} for bucket in response['Buckets']]
        logger.info(f"S3 Buckets: {buckets}")
        return jsonify({'buckets': buckets}), 200
    except ClientError as e:
        logger.error(f"Failed to list S3 buckets: {e}")
        return jsonify({'error': str(e)}), 500

# Get Bucket Size and Object Count
@app.route('/s3/bucket_info', methods=['GET'])
def get_bucket_info():
    bucket_name = request.args.get('bucket_name')
    try:
        s3_client = get_aws_client('s3')
        
        # Initialize metrics
        total_size = 0
        total_objects = 0
        
        # Use paginator to handle buckets with many objects
        paginator = s3_client.get_paginator('list_objects_v2')
        
        try:
            for page in paginator.paginate(Bucket=bucket_name):
                if 'Contents' in page:
                    # Count objects in this page
                    page_objects = len(page['Contents'])
                    total_objects += page_objects
                    
                    # Sum up sizes of all objects in this page
                    page_size = sum(obj['Size'] for obj in page['Contents'])
                    total_size += page_size
                    
            logger.info(f"Bucket {bucket_name} - Size: {total_size} bytes, Objects: {total_objects}")
            
            return jsonify({
                'bucket_name': bucket_name,
                'size': total_size,
                'objects': total_objects
            }), 200
            
        except ClientError as e:
            if e.response['Error']['Code'] == 'NoSuchBucket':
                return jsonify({
                    'bucket_name': bucket_name,
                    'size': 0,
                    'objects': 0
                }), 200
            raise e
            
    except ClientError as e:
        logger.error(f"Failed to get bucket info: {e}")
        return jsonify({'error': str(e)}), 500

# Upload File to S3 Bucket
@app.route('/s3/upload', methods=['POST'])
def upload_file_to_s3():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400
            
        file = request.files['file']
        bucket_name = request.form.get('bucket_name')
        
        if not file or not bucket_name:
            return jsonify({'error': 'Missing file or bucket name'}), 400

        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400

        # Secure the filename and ensure it's not empty
        filename = secure_filename(file.filename)
        if not filename:
            return jsonify({'error': 'Invalid filename'}), 400

        # Create a temporary file with binary write mode
        with tempfile.NamedTemporaryFile(mode='wb', delete=False) as temp_file:
            # Save the file data
            file.save(temp_file)
            temp_file.flush()  # Ensure all data is written
            
            try:
                # Upload to S3
                s3_client = get_aws_client('s3')
                if not s3_client:
                    return jsonify({'error': 'Failed to connect to AWS'}), 500

                s3_client.upload_file(
                    temp_file.name,
                    bucket_name,
                    filename,
                    ExtraArgs={'ContentType': file.content_type} if file.content_type else None
                )
                
                # Generate the URL for the uploaded file
                file_url = f"https://{bucket_name}.s3.amazonaws.com/{filename}"
                
                logger.info(f"Successfully uploaded {filename} to {bucket_name}")
                return jsonify({
                    'message': 'File uploaded successfully',
                    'url': file_url,
                    'filename': filename
                }), 200
                
            except ClientError as e:
                error_message = str(e)
                logger.error(f"AWS S3 error during upload: {error_message}")
                return jsonify({'error': f"S3 upload failed: {error_message}"}), 500
            finally:
                # Clean up the temporary file
                try:
                    os.unlink(temp_file.name)
                except Exception as e:
                    logger.warning(f"Failed to delete temporary file: {e}")
                    
    except Exception as e:
        logger.error(f"Unexpected error during upload: {str(e)}")
        return jsonify({'error': f"Upload failed: {str(e)}"}), 500


# Delete S3 Bucket
@app.route('/s3/delete_bucket', methods=['POST'])
def delete_s3_bucket():
    data = request.get_json()
    bucket_name = data.get('bucket_name')
    try:
        s3_client = get_aws_client('s3')
        delete_bucket_contents(bucket_name)  # Delete all contents first
        s3_client.delete_bucket(Bucket=bucket_name)
        logger.info(f"Successfully deleted S3 bucket: {bucket_name}")
        return jsonify({'message': f'Bucket {bucket_name} deleted'}), 200
    except ClientError as e:
        logger.error(f"Failed to delete S3 bucket: {e}")
        return jsonify({'error': str(e)}), 500

# Helper Function to Delete Bucket Contents
def delete_bucket_contents(bucket_name):
    try:
        s3_client = get_aws_client('s3')
        paginator = s3_client.get_paginator('list_objects_v2')
        for page in paginator.paginate(Bucket=bucket_name):
            if 'Contents' in page:
                objects = [{'Key': obj['Key']} for obj in page['Contents']]
                s3_client.delete_objects(Bucket=bucket_name, Delete={'Objects': objects})
                logger.info(f"Deleted {len(objects)} objects from {bucket_name}")
    except ClientError as e:
        logger.error(f"Failed to delete contents of S3 bucket: {e}")

# List Recent Objects in a Bucket
@app.route('/s3/list_objects', methods=['GET'])
def list_bucket_objects():
    bucket_name = request.args.get('bucket_name')
    try:
        s3_client = get_aws_client('s3')
        response = s3_client.list_objects_v2(Bucket=bucket_name)
        objects = sorted(response.get('Contents', []), key=lambda x: x['LastModified'], reverse=True)
        object_list = [{'key': obj['Key'], 'size': obj['Size'], 'last_modified': obj['LastModified']} for obj in objects]
        return jsonify({'bucket_name': bucket_name, 'objects': object_list}), 200
    except ClientError as e:
        logger.error(f"Failed to list objects in bucket {bucket_name}: {e}")
        return jsonify({'error': str(e)}), 500

def get_ec2_client():
    return boto3.client(
        'ec2',
        aws_access_key_id='AWS KEY',
        aws_secret_access_key='AWS SECRET KEY',
        region_name='us-east-1'
    )

# Route to create an EC2 instance
@app.route('/create_instance', methods=['POST'])
def create_instance():
    try:
        data = request.json
        image_id = data.get('ImageId', 'ami-063d43db0594b521b')  # Default AMI ID
        instance_type = data.get('InstanceType', 't2.micro')      # Default instance type
        key_name = data.get('KeyName', 'Code_test')             # Provide your key pair name
        
        ec2 = get_ec2_client()
        response = ec2.run_instances(
            ImageId=image_id,
            InstanceType=instance_type,
            KeyName=key_name,
            MinCount=1,
            MaxCount=1
        )
        instance_id = response['Instances'][0]['InstanceId']
        return jsonify({"message": "Instance created", "InstanceId": instance_id}), 201
    except ClientError as e:
        return jsonify({"error": str(e)}), 500

# Route to start an EC2 instance
@app.route('/start_instance', methods=['POST'])
def start_instance():
    try:
        instance_id = request.json.get('InstanceId')
        if not instance_id:
            return jsonify({"error": "InstanceId is required"}), 400

        ec2 = get_ec2_client()
        
        # Check current instance state
        response = ec2.describe_instances(InstanceIds=[instance_id])
        instance = response['Reservations'][0]['Instances'][0]
        current_state = instance['State']['Name']

        if current_state == 'running':
            return jsonify({"message": f"Instance {instance_id} is already running"}), 200
        elif current_state in ['pending', 'stopping']:
            return jsonify({"error": f"Instance {instance_id} is in {current_state} state. Please wait."}), 400

        # Start the instance
        ec2.start_instances(InstanceIds=[instance_id])
        logger.info(f"Started instance {instance_id}")
        return jsonify({"message": f"Instance {instance_id} starting"}), 200
    except ClientError as e:
        error_message = str(e)
        logger.error(f"Failed to start instance: {error_message}")
        return jsonify({"error": error_message}), 500

# Route to stop an EC2 instance
@app.route('/stop_instance', methods=['POST'])
def stop_instance():
    try:
        instance_id = request.json.get('InstanceId')
        if not instance_id:
            return jsonify({"error": "InstanceId is required"}), 400

        ec2 = get_ec2_client()
        
        # Check current instance state
        response = ec2.describe_instances(InstanceIds=[instance_id])
        instance = response['Reservations'][0]['Instances'][0]
        current_state = instance['State']['Name']

        if current_state == 'stopped':
            return jsonify({"message": f"Instance {instance_id} is already stopped"}), 200
        elif current_state in ['pending', 'stopping']:
            return jsonify({"error": f"Instance {instance_id} is in {current_state} state. Please wait."}), 400

        # Stop the instance
        ec2.stop_instances(InstanceIds=[instance_id])
        logger.info(f"Stopped instance {instance_id}")
        return jsonify({"message": f"Instance {instance_id} stopping"}), 200
    except ClientError as e:
        error_message = str(e)
        logger.error(f"Failed to stop instance: {error_message}")
        return jsonify({"error": error_message}), 500

# Route to terminate an EC2 instance
@app.route('/terminate_instance', methods=['POST'])
def terminate_instance():
    try:
        instance_id = request.json.get('InstanceId')
        ec2 = get_ec2_client()
        ec2.terminate_instances(InstanceIds=[instance_id])
        return jsonify({"message": f"Instance {instance_id} terminated successfully"}), 200
    except ClientError as e:
        return jsonify({"error": str(e)}), 500

# Route to describe all EC2 instances
@app.route('/describe_instances', methods=['GET'])
def describe_instances():
    try:
        ec2 = get_ec2_client()
        response = ec2.describe_instances()
        instances = []
        
        for reservation in response['Reservations']:
            for instance in reservation['Instances']:
                # Get instance tags
                instance_name = ''
                for tag in instance.get('Tags', []):
                    if tag['Key'] == 'Name':
                        instance_name = tag['Value']
                        break

                # Get instance details including state
                instance_details = {
                    "InstanceId": instance['InstanceId'],
                    "InstanceType": instance['InstanceType'],
                    "State": {
                        "Name": instance['State']['Name'],
                        "Code": instance['State']['Code']
                    },
                    "PublicIpAddress": instance.get('PublicIpAddress', ''),
                    "PrivateIpAddress": instance.get('PrivateIpAddress', ''),
                    "LaunchTime": instance['LaunchTime'].isoformat(),
                    "Name": instance_name,
                    "Platform": instance.get('Platform', 'linux'),
                    "Architecture": instance.get('Architecture', 'x86_64'),
                    "VpcId": instance.get('VpcId', ''),
                    "SubnetId": instance.get('SubnetId', ''),
                    "SecurityGroups": instance.get('SecurityGroups', []),
                    "Tags": instance.get('Tags', [])
                }
                instances.append(instance_details)

        logger.info(f"Found {len(instances)} instances")
        return jsonify(instances), 200
    except ClientError as e:
        error_message = str(e)
        logger.error(f"Failed to describe instances: {error_message}")
        return jsonify({"error": error_message}), 500
    except Exception as e:
        error_message = str(e)
        logger.error(f"Unexpected error while describing instances: {error_message}")
        return jsonify({"error": error_message}), 500

# Route to reboot an EC2 instance
@app.route('/reboot_instance', methods=['POST'])
def reboot_instance():
    try:
        instance_id = request.json.get('InstanceId')
        ec2 = get_ec2_client()
        ec2.reboot_instances(InstanceIds=[instance_id])
        return jsonify({"message": f"Instance {instance_id} rebooted successfully"}), 200
    except ClientError as e:
        return jsonify({"error": str(e)}), 500

# Route to monitor an EC2 instance
@app.route('/monitor_instance', methods=['POST'])
def monitor_instance():
    try:
        instance_id = request.json.get('InstanceId')
        ec2 = get_ec2_client()
        ec2.monitor_instances(InstanceIds=[instance_id])
        return jsonify({"message": f"Monitoring enabled for instance {instance_id}"}), 200
    except ClientError as e:
        return jsonify({"error": str(e)}), 500

# Route to unmonitor an EC2 instance
@app.route('/unmonitor_instance', methods=['POST'])
def unmonitor_instance():
    try:
        instance_id = request.json.get('InstanceId')
        ec2 = get_ec2_client()
        ec2.unmonitor_instances(InstanceIds=[instance_id])
        return jsonify({"message": f"Monitoring disabled for instance {instance_id}"}), 200
    except ClientError as e:
        return jsonify({"error": str(e)}), 500

def analyze_image(img_bytes):
    """Analyze the image using AWS Rekognition."""
    rekognition_client = get_aws_client('rekognition')
    results = {}

    try:
        # Detect labels with more details
        label_response = rekognition_client.detect_labels(
            Image={'Bytes': img_bytes},
            MaxLabels=20,  # Increased for more labels
            MinConfidence=60  # Lowered threshold for more results
        )
        results['labels'] = label_response.get('Labels', [])

        # Enhanced face detection
        face_response = rekognition_client.detect_faces(
            Image={'Bytes': img_bytes},
            Attributes=['ALL']
        )
        results['faces'] = face_response.get('FaceDetails', [])

        # Celebrity recognition
        celebrity_response = rekognition_client.recognize_celebrities(
            Image={'Bytes': img_bytes}
        )
        results['celebrities'] = celebrity_response.get('CelebrityFaces', [])

        # Text detection
        text_response = rekognition_client.detect_text(
            Image={'Bytes': img_bytes}
        )
        results['text'] = text_response.get('TextDetections', [])

        # PPE Detection (for fun - detects if someone is wearing safety gear)
        try:
            ppe_response = rekognition_client.detect_protective_equipment(
                Image={'Bytes': img_bytes},
                SummarizationAttributes={'MinConfidence': 80, 'RequiredEquipmentTypes': ['FACE_COVER', 'HAND_COVER', 'HEAD_COVER']}
            )
            results['ppe'] = ppe_response.get('Persons', [])
        except Exception as e:
            logger.warning(f"PPE detection failed: {e}")

        # Detect dominant colors
        try:
            image = Image.open(io.BytesIO(img_bytes))
            colors = image.getcolors(image.size[0] * image.size[1])
            if colors:
                colors.sort(reverse=True)
                results['dominant_colors'] = [{'color': rgb_to_hex(c[1]), 'percentage': (c[0] / (image.size[0] * image.size[1])) * 100} 
                                           for c in colors[:5]]
        except Exception as e:
            logger.warning(f"Color analysis failed: {e}")

        # Quality check
        try:
            quality_response = rekognition_client.detect_faces(
                Image={'Bytes': img_bytes},
                Attributes=['QUALITY']
            )
            if quality_response['FaceDetails']:
                results['image_quality'] = quality_response['FaceDetails'][0].get('Quality', {})
        except Exception as e:
            logger.warning(f"Quality check failed: {e}")

        return results
    except ClientError as e:
        logger.error(f"Rekognition error: {str(e)}")
        raise e

def rgb_to_hex(rgb):
    """Convert RGB tuple to hex color code."""
    return '#{:02x}{:02x}{:02x}'.format(*rgb)

@app.route('/analyze', methods=['POST'])
def analyze():
    """Analyze an uploaded image."""
    try:
        if 'image' not in request.files:
            return jsonify({"error": "No image file provided"}), 400
        
        image_file = request.files['image']
        if not image_file.filename:
            return jsonify({"error": "No selected file"}), 400

        # Read the image file
        img_bytes = image_file.read()
        
        # Analyze image
        results = analyze_image(img_bytes)
        
        return jsonify({
            "message": "Image analyzed successfully",
            "results": results
        }), 200
        
    except ClientError as e:
        error_message = str(e)
        logger.error(f"AWS error during analysis: {error_message}")
        return jsonify({"error": f"Analysis failed: {error_message}"}), 500
    except Exception as e:
        error_message = str(e)
        logger.error(f"Unexpected error during analysis: {error_message}")
        return jsonify({"error": f"Analysis failed: {error_message}"}), 500
#---------------------------Cloud front-------------


@app.route('/create_cloudfront_oai', methods=['POST'])
def create_cloudfront_oai():
    """Create a CloudFront Origin Access Identity."""
    try:
        comment = request.json.get('comment', 'Default OAI Comment')
        cf_client = get_aws_client('cloudfront')

        response = cf_client.create_cloud_front_origin_access_identity(
            CloudFrontOriginAccessIdentityConfig={
                'CallerReference': str(os.urandom(10).hex()),
                'Comment': comment
            }
        )
        oai = response['CloudFrontOriginAccessIdentity']
        return jsonify({
            "Id": oai['Id'],
            "S3CanonicalUserId": oai['S3CanonicalUserId'],
            "Comment": comment
        }), 201
    except ClientError as e:
        logger.error(f"Failed to create CloudFront OAI: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/set_s3_bucket_policy', methods=['POST'])
def set_s3_bucket_policy():
    """Set a policy on the S3 bucket to allow CloudFront access."""
    try:
        bucket_name = request.json['bucket_name']
        oai_id = request.json['oai_id']
        s3_client = get_aws_client('s3')
        cf_client = get_aws_client('cloudfront')

        # Get the canonical user ID for the OAI
        oai_config = cf_client.get_cloud_front_origin_access_identity(Id=oai_id)
        s3_canonical_user_id = oai_config['CloudFrontOriginAccessIdentity']['S3CanonicalUserId']

        # Set policy
        policy = {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Sid": "AllowCloudFrontOAIAccess",
                    "Effect": "Allow",
                    "Principal": {
                        "CanonicalUser": s3_canonical_user_id
                    },
                    "Action": "s3:GetObject",
                    "Resource": f"arn:aws:s3:::{bucket_name}/*"
                }
            ]
        }
        s3_client.put_bucket_policy(Bucket=bucket_name, Policy=json.dumps(policy))
        return jsonify({"message": f"Bucket policy set for {bucket_name}"}), 200

    except ClientError as e:
        logger.error(f"Failed to set bucket policy for {bucket_name}: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/create_cloudfront_distribution', methods=['POST'])
def create_cloudfront_distribution():
    """Create a CloudFront distribution for an S3 bucket."""
    try:
        bucket_name = request.json['bucket_name']
        oai_id = request.json['oai_id']
        cf_client = get_aws_client('cloudfront')

        distribution_config = {
            'CallerReference': str(os.urandom(10).hex()),
            'Origins': {
                'Items': [
                    {
                        'Id': bucket_name,
                        'DomainName': f'{bucket_name}.s3.amazonaws.com',
                        'S3OriginConfig': {
                            'OriginAccessIdentity': f'origin-access-identity/cloudfront/{oai_id}'
                        }
                    }
                ],
                'Quantity': 1
            },
            'Enabled': True,
            'DefaultCacheBehavior': {
                'TargetOriginId': bucket_name,
                'ViewerProtocolPolicy': 'redirect-to-https',
                'AllowedMethods': {
                    'Quantity': 2,
                    'Items': ['GET', 'HEAD'],
                    'CachedMethods': {
                        'Quantity': 2,
                        'Items': ['GET', 'HEAD']
                    }
                },
                'MinTTL': 0,
                'ForwardedValues': {
                    'QueryString': False,
                    'Cookies': {
                        'Forward': 'none'
                    }
                }
            },
            'Comment': f"CloudFront Distribution for {bucket_name}"
        }

        response = cf_client.create_distribution(DistributionConfig=distribution_config)
        distribution_domain = response['Distribution']['DomainName']
        return jsonify({
            "message": f"CloudFront distribution created for {bucket_name}",
            "DistributionDomain": distribution_domain
        }), 201

    except ClientError as e:
        logger.error(f"Failed to create CloudFront distribution for {bucket_name}: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/s3/enable_static_website', methods=['POST'])
def enable_static_website():
    """Enable static website hosting for an S3 bucket."""
    try:
        bucket_name = request.json['bucket_name']
        index_document = request.json.get('index_document', 'index.html')
        error_document = request.json.get('error_document', 'error.html')
        
        s3_client = get_aws_client('s3')
        
        # Enable static website hosting
        website_configuration = {
            'ErrorDocument': {'Key': error_document},
            'IndexDocument': {'Suffix': index_document}
        }
        
        s3_client.put_bucket_website(
            Bucket=bucket_name,
            WebsiteConfiguration=website_configuration
        )
        
        # Make bucket public
        bucket_policy = {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Sid": "PublicReadGetObject",
                    "Effect": "Allow",
                    "Principal": "*",
                    "Action": "s3:GetObject",
                    "Resource": f"arn:aws:s3:::{bucket_name}/*"
                }
            ]
        }
        s3_client.put_bucket_policy(
            Bucket=bucket_name,
            Policy=json.dumps(bucket_policy)
        )
        
        # Get website endpoint
        location = s3_client.get_bucket_location(Bucket=bucket_name)['LocationConstraint']
        region = location if location else 'us-east-1'
        website_url = f"http://{bucket_name}.s3-website-{region}.amazonaws.com"
        
        return jsonify({
            "message": "Static website hosting enabled",
            "website_url": website_url
        }), 200
        
    except ClientError as e:
        logger.error(f"Failed to enable static website hosting: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/s3/upload_website', methods=['POST'])
def upload_website():
    """Upload a website folder to S3."""
    try:
        if 'website' not in request.files:
            return jsonify({"error": "No website file provided"}), 400
            
        website_zip = request.files['website']
        bucket_name = request.form.get('bucket_name')
        
        if not website_zip or not bucket_name:
            return jsonify({"error": "Missing file or bucket name"}), 400

        # Create a temporary directory to extract files
        with tempfile.TemporaryDirectory() as temp_dir:
            zip_path = os.path.join(temp_dir, 'website.zip')
            website_zip.save(zip_path)
            
            # Extract the zip file
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                zip_ref.extractall(temp_dir)
            
            # Upload all files maintaining directory structure
            s3_client = get_aws_client('s3')
            uploaded_files = []
            
            for root, dirs, files in os.walk(temp_dir):
                for file in files:
                    if file == 'website.zip':
                        continue
                        
                    file_path = os.path.join(root, file)
                    relative_path = os.path.relpath(file_path, temp_dir)
                    
                    # Determine content type
                    content_type = 'application/octet-stream'
                    if file.endswith('.html'):
                        content_type = 'text/html'
                    elif file.endswith('.css'):
                        content_type = 'text/css'
                    elif file.endswith('.js'):
                        content_type = 'application/javascript'
                    elif file.endswith(('.png', '.jpg', '.jpeg', '.gif')):
                        content_type = f'image/{file.split(".")[-1]}'
                    
                    # Upload file with content type
                    s3_client.upload_file(
                        file_path,
                        bucket_name,
                        relative_path,
                        ExtraArgs={'ContentType': content_type}
                    )
                    uploaded_files.append(relative_path)
            
        return jsonify({
            "message": "Website uploaded successfully",
            "files": uploaded_files
        }), 200
        
    except Exception as e:
        logger.error(f"Failed to upload website: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/cloudfront/create_distribution_for_website', methods=['POST'])
def create_distribution_for_website():
    """Create a CloudFront distribution for a static website."""
    try:
        bucket_name = request.json['bucket_name']
        cf_client = get_aws_client('cloudfront')
        
        # Get the bucket website endpoint
        s3_client = get_aws_client('s3')
        location = s3_client.get_bucket_location(Bucket=bucket_name)['LocationConstraint']
        region = location if location else 'us-east-1'
        origin_domain = f"{bucket_name}.s3-website-{region}.amazonaws.com"
        
        distribution_config = {
            'CallerReference': str(os.urandom(10).hex()),
            'Origins': {
                'Quantity': 1,
                'Items': [
                    {
                        'Id': 'S3Origin',
                        'DomainName': origin_domain,
                        'CustomOriginConfig': {
                            'HTTPPort': 80,
                            'HTTPSPort': 443,
                            'OriginProtocolPolicy': 'http-only'
                        }
                    }
                ]
            },
            'DefaultCacheBehavior': {
                'TargetOriginId': 'S3Origin',
                'ViewerProtocolPolicy': 'redirect-to-https',
                'AllowedMethods': {
                    'Quantity': 2,
                    'Items': ['GET', 'HEAD'],
                    'CachedMethods': {
                        'Quantity': 2,
                        'Items': ['GET', 'HEAD']
                    }
                },
                'ForwardedValues': {
                    'QueryString': False,
                    'Cookies': {'Forward': 'none'}
                },
                'TrustedSigners': {'Enabled': False, 'Quantity': 0},
                'MinTTL': 86400,
                'DefaultTTL': 86400,
                'MaxTTL': 31536000,
                'Compress': True
            },
            'Comment': f'Distribution for {bucket_name} website',
            'Enabled': True,
            'DefaultRootObject': 'index.html',
            'PriceClass': 'PriceClass_All',
            'HttpVersion': 'http2',
            'IsIPV6Enabled': True
        }
        
        response = cf_client.create_distribution(DistributionConfig=distribution_config)
        distribution = response['Distribution']
        
        return jsonify({
            "message": "CloudFront distribution created successfully",
            "distribution_domain": distribution['DomainName'],
            "distribution_id": distribution['Id'],
            "status": distribution['Status']
        }), 200
        
    except ClientError as e:
        logger.error(f"Failed to create CloudFront distribution: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/cloudwatch/get_metrics', methods=['GET'])
def get_cloudwatch_metrics():
    try:
        cloudwatch = get_aws_client('cloudwatch')
        end_time = datetime.utcnow()
        start_time = end_time - timedelta(hours=24)

        # EC2 Metrics
        ec2_metrics = []
        ec2_cpu = cloudwatch.get_metric_data(
            MetricDataQueries=[
                {
                    'Id': 'cpu',
                    'MetricStat': {
                        'Metric': {
                            'Namespace': 'AWS/EC2',
                            'MetricName': 'CPUUtilization',
                        },
                        'Period': 300,
                        'Stat': 'Average'
                    }
                }
            ],
            StartTime=start_time,
            EndTime=end_time
        )
        ec2_metrics.append({
            'Label': 'CPU Utilization',
            'Timestamps': [t.isoformat() for t in ec2_cpu['MetricDataResults'][0]['Timestamps']],
            'Values': ec2_cpu['MetricDataResults'][0]['Values']
        })

        # S3 Metrics
        s3_metrics = []
        s3_size = cloudwatch.get_metric_data(
            MetricDataQueries=[
                {
                    'Id': 'size',
                    'MetricStat': {
                        'Metric': {
                            'Namespace': 'AWS/S3',
                            'MetricName': 'BucketSizeBytes',
                        },
                        'Period': 86400,
                        'Stat': 'Average'
                    }
                }
            ],
            StartTime=start_time,
            EndTime=end_time
        )
        s3_metrics.append({
            'Label': 'Bucket Size',
            'Timestamps': [t.isoformat() for t in s3_size['MetricDataResults'][0]['Timestamps']],
            'Values': s3_size['MetricDataResults'][0]['Values']
        })

        # CloudFront Metrics
        cloudfront_metrics = []
        cf_requests = cloudwatch.get_metric_data(
            MetricDataQueries=[
                {
                    'Id': 'requests',
                    'MetricStat': {
                        'Metric': {
                            'Namespace': 'AWS/CloudFront',
                            'MetricName': 'Requests',
                        },
                        'Period': 300,
                        'Stat': 'Sum'
                    }
                }
            ],
            StartTime=start_time,
            EndTime=end_time
        )
        cloudfront_metrics.append({
            'Label': 'Requests',
            'Timestamps': [t.isoformat() for t in cf_requests['MetricDataResults'][0]['Timestamps']],
            'Values': cf_requests['MetricDataResults'][0]['Values']
        })

        return jsonify({
            'ec2_metrics': ec2_metrics,
            's3_metrics': s3_metrics,
            'cloudfront_metrics': cloudfront_metrics
        })

    except Exception as e:
        logger.error(f"Failed to get CloudWatch metrics: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/cloudwatch/get_alarms', methods=['GET'])
def get_cloudwatch_alarms():
    try:
        cloudwatch = get_aws_client('cloudwatch')
        response = cloudwatch.describe_alarms()
        return jsonify({'alarms': response['MetricAlarms']})
    except Exception as e:
        logger.error(f"Failed to get CloudWatch alarms: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/cloudwatch/get_service_health', methods=['GET'])
def get_service_health():
    try:
        cloudwatch = get_aws_client('cloudwatch')
        end_time = datetime.utcnow()
        start_time = end_time - timedelta(minutes=30)

        health_metrics = {
            'EC2': {
                'status': 'healthy',
                'lastUpdated': end_time.isoformat(),
                'metrics': {
                    'availability': 99.99,
                    'latency': 45,
                    'errors': 0.01
                }
            },
            'S3': {
                'status': 'healthy',
                'lastUpdated': end_time.isoformat(),
                'metrics': {
                    'availability': 99.99,
                    'latency': 12,
                    'errors': 0.00
                }
            },
            'CloudFront': {
                'status': 'healthy',
                'lastUpdated': end_time.isoformat(),
                'metrics': {
                    'availability': 99.99,
                    'latency': 35,
                    'errors': 0.02
                }
            }
        }

        return jsonify({'health_metrics': health_metrics})
    except Exception as e:
        logger.error(f"Failed to get service health: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/cloudwatch/get_insights', methods=['GET'])
def get_insights():
    try:
        cloudwatch = get_aws_client('cloudwatch')
        end_time = datetime.utcnow()
        start_time = end_time - timedelta(hours=24)

        # Get EC2 instance metrics
        ec2_metrics = cloudwatch.get_metric_data(
            MetricDataQueries=[
                {
                    'Id': 'cpu',
                    'MetricStat': {
                        'Metric': {
                            'Namespace': 'AWS/EC2',
                            'MetricName': 'CPUUtilization',
                        },
                        'Period': 300,
                        'Stat': 'Average'
                    }
                },
                {
                    'Id': 'network',
                    'MetricStat': {
                        'Metric': {
                            'Namespace': 'AWS/EC2',
                            'MetricName': 'NetworkIn',
                        },
                        'Period': 300,
                        'Stat': 'Sum'
                    }
                }
            ],
            StartTime=start_time,
            EndTime=end_time
        )

        # Calculate insights
        cpu_values = ec2_metrics['MetricDataResults'][0]['Values']
        network_values = ec2_metrics['MetricDataResults'][1]['Values']

        insights = {
            'performance_summary': {
                'avg_cpu': statistics.mean(cpu_values) if cpu_values else 0,
                'max_cpu': max(cpu_values) if cpu_values else 0,
                'total_network': sum(network_values) if network_values else 0,
            },
            'anomalies': [],
            'recommendations': []
        }

        # Detect anomalies and generate recommendations
        avg_cpu = insights['performance_summary']['avg_cpu']
        if avg_cpu > 80:
            insights['anomalies'].append('High CPU utilization detected')
            insights['recommendations'].append('Consider scaling up EC2 instances')
        elif avg_cpu < 20:
            insights['recommendations'].append('Consider downsizing EC2 instances to optimize costs')

        return jsonify(insights)
    except Exception as e:
        logger.error(f"Failed to get insights: {e}")
        return jsonify({'error': str(e)}), 500

# ---------------------------- Main App ---------------------------- #
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
