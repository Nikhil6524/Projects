import logging
import os
import json
from azure.identity import AzureCliCredential
from azure.mgmt.compute import ComputeManagementClient
from azure.mgmt.resource import ResourceManagementClient
from azure.mgmt.storage import StorageManagementClient
from azure.mgmt.network import NetworkManagementClient
from azure.storage.blob import BlobServiceClient
from azure.core.exceptions import ResourceNotFoundError
from azure.mgmt.cdn import CdnManagementClient
from azure.mgmt.cdn.models import Sku, Endpoint, Origin, Profile, EndpointUpdateParameters

# Configure logging to a file
logging.basicConfig(filename='azure_operations.log', level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger()

# Use Azure CLI to authenticate
credential = AzureCliCredential()

# Replace these with your actual Azure details
subscription_id = ""  # Set your Azure subscription ID
resource_group_name = ''
location = 'global'  # Use the region of your VM

# Initialize the Azure management clients
resource_client = ResourceManagementClient(credential, subscription_id)
compute_client = ComputeManagementClient(credential, subscription_id)
storage_client = StorageManagementClient(credential, subscription_id)
network_client = NetworkManagementClient(credential, subscription_id)
cdn_client = CdnManagementClient(credential, subscription_id)

# --- Azure Blob Storage Operations ---
def create_container(storage_account_name, container_name):
    try:
        blob_service_client = BlobServiceClient(account_url=f"https://{storage_account_name}.blob.core.windows.net", credential=credential)
        container_client = blob_service_client.get_container_client(container_name)
        container_client.create_container()
        logger.info(f"Blob container '{container_name}' created successfully.")
        print(f"Blob container '{container_name}' created successfully.")
    except Exception as e:
        logger.error(f"Failed to create Blob container: {e}")
        print(f"Failed to create Blob container: {e}")

def upload_file_to_blob(storage_account_name, container_name, file_path):
    try:
        blob_service_client = BlobServiceClient(account_url=f"https://{storage_account_name}.blob.core.windows.net", credential=credential)
        container_client = blob_service_client.get_container_client(container_name)
        blob_client = container_client.get_blob_client(os.path.basename(file_path))

        with open(file_path, "rb") as file:
            blob_client.upload_blob(file)
        logger.info(f"File '{file_path}' uploaded to Blob container '{container_name}' successfully.")
        print(f"File '{file_path}' uploaded to Blob container '{container_name}' successfully.")
        return f"https://{storage_account_name}.blob.core.windows.net/{container_name}/{os.path.basename(file_path)}"
    except Exception as e:
        logger.error(f"Failed to upload file to Blob: {e}")
        print(f"Failed to upload file to Blob: {e}")
        return None

# --- Azure CDN Operations ---
def create_cdn_profile(profile_name):
    try:
        profile_params = Profile(location=location, sku=Sku(name='Standard_Microsoft'))
        cdn_profile = cdn_client.profiles.begin_create(
            resource_group_name,
            profile_name,
            profile_params
        ).result()
        logger.info(f"CDN profile '{cdn_profile.name}' created successfully.")
        print(f"CDN profile '{cdn_profile.name}' created successfully.")
        return cdn_profile
    except Exception as e:
        logger.error(f"Failed to create CDN profile: {e}")
        print(f"Failed to create CDN profile: {e}")
        return None

def create_cdn_endpoint(profile_name, endpoint_name, storage_account_name, container_name):
    try:
        endpoint_params = Endpoint(
            location=location,
            origins=[
                Origin(
                    name=f'{storage_account_name}.blob.core.windows.net',
                    host_name=f'{storage_account_name}.blob.core.windows.net'
                )
            ],
            is_http_allowed=True,
            is_https_allowed=True
        )

        endpoint = cdn_client.endpoints.begin_create(
            resource_group_name,
            profile_name,
            endpoint_name,
            endpoint_params
        ).result()
        logger.info(f"CDN endpoint '{endpoint.name}' created successfully.")
        print(f"CDN endpoint '{endpoint.name}' created successfully.")
        return endpoint.host_name
    except Exception as e:
        logger.error(f"Failed to create CDN endpoint: {e}")
        print(f"Failed to create CDN endpoint: {e}")
        return None

def update_cdn_endpoint(profile_name, endpoint_name):
    try:
        update_params = EndpointUpdateParameters(is_https_allowed=True)
        cdn_client.endpoints.begin_update(
            resource_group_name,
            profile_name,
            endpoint_name,
            update_params
        ).result()
        logger.info(f"CDN endpoint '{endpoint_name}' updated successfully.")
        print(f"CDN endpoint '{endpoint_name}' updated successfully.")
    except Exception as e:
        logger.error(f"Failed to update CDN endpoint: {e}")
        print(f"Failed to update CDN endpoint: {e}")

# --- Main Execution ---
if __name__ == "__main__":
    # Azure Blob Storage operations
    storage_account_name = ""
    container_name = ""
    file_path = "C:/Users/aryan/Desktop/CloudComputing/aws_flask_api/index123.html"  # Replace with the actual file path

    # Step 1: Create Blob container
    create_container(storage_account_name, container_name)

    # Step 2: Upload file to Blob
    uploaded_file_url = upload_file_to_blob(storage_account_name, container_name, file_path)
    if not uploaded_file_url:
        logger.error("Failed to upload file")
        exit(1)

    # Azure CDN operations
    profile_name = ""
    endpoint_name = ""

    # Step 3: Create CDN Profile
    cdn_profile = create_cdn_profile(profile_name)
    if not cdn_profile:
        logger.error("Failed to create CDN profile")
        exit(1)

    # Step 4: Create CDN Endpoint
    cdn_endpoint_hostname = create_cdn_endpoint(profile_name, endpoint_name, storage_account_name, container_name)
    if cdn_endpoint_hostname:
        logger.info(f"Access your content at: https://{cdn_endpoint_hostname}/{os.path.basename(file_path)}")
        print(f"Access your content at: https://{cdn_endpoint_hostname}/{os.path.basename(file_path)}")
    else:
        logger.error("Failed to create CDN endpoint")
        exit(1)

    # Optional: Update CDN Endpoint settings
    update_cdn_endpoint(profile_name, endpoint_name)
