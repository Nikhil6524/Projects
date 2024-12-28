import logging
import os
from azure.identity import AzureCliCredential
from azure.mgmt.compute import ComputeManagementClient
from azure.mgmt.resource import ResourceManagementClient
from azure.mgmt.storage import StorageManagementClient
from azure.mgmt.network import NetworkManagementClient
from azure.storage.blob import BlobServiceClient
from azure.core.exceptions import ResourceNotFoundError

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(message)s')
logger = logging.getLogger()

# Use Azure CLI to authenticate
credential = AzureCliCredential()

# Replace these with your actual Azure details
subscription_id = os.getenv('AZURE_SUBSCRIPTION_ID')
resource_group_name = 'Main_free'
location = 'West US 2'  # Use the region of your VM
admin_username = os.getenv('AZURE_VM_USERNAME')
admin_password = os.getenv('AZURE_VM_PASSWORD')

# Initialize the Azure management clients
resource_client = ResourceManagementClient(credential, subscription_id)
compute_client = ComputeManagementClient(credential, subscription_id)
storage_client = StorageManagementClient(credential, subscription_id)
network_client = NetworkManagementClient(credential, subscription_id)

# --- Azure Network Operations ---
def create_vnet(resource_group_name, location, vnet_name, subnet_name):
    try:
        vnet_params = {
            'location': location,
            'address_space': {
                'address_prefixes': ['10.0.0.0/16']
            },
            'subnets': [
                {
                    'name': subnet_name,
                    'address_prefix': '10.0.0.0/24'
                }
            ]
        }
        vnet = network_client.virtual_networks.begin_create_or_update(
            resource_group_name,
            vnet_name,
            vnet_params
        ).result()
        logger.info(f"VNet '{vnet.name}' created successfully.")
        return vnet
    except Exception as e:
        logger.error(f"Failed to create VNet: {e}")
        return None

def create_network_interface(resource_group_name, location, vnet_name, subnet_name, nic_name):
    try:
        subnet_info = network_client.subnets.get(resource_group_name, vnet_name, subnet_name)
        nic_params = {
            'location': location,
            'ip_configurations': [{
                'name': f'{nic_name}_ip_config',
                'subnet': {
                    'id': subnet_info.id
                }
            }]
        }
        nic = network_client.network_interfaces.begin_create_or_update(resource_group_name, nic_name, nic_params).result()
        logger.info(f"NIC '{nic.name}' created successfully.")
        return nic.id
    except Exception as e:
        logger.error(f"Failed to create NIC: {e}")
        return None

# --- Azure VM Operations ---
def create_vm(vm_name, image_reference, vm_size, admin_username, admin_password, nic_id):
    try:
        vm_parameters = {
            "location": location,
            "hardware_profile": {"vm_size": vm_size},
            "storage_profile": {
                "image_reference": {
                    "publisher": image_reference["publisher"],
                    "offer": image_reference["offer"],
                    "sku": image_reference["sku"],
                    "version": "latest"
                }
            },
            "os_profile": {
                "computer_name": vm_name,
                "admin_username": admin_username,
                "admin_password": admin_password
            },
            "network_profile": {
                "network_interfaces": [{
                    "id": nic_id
                }]
            }
        }

        creation_result = compute_client.virtual_machines.begin_create_or_update(
            resource_group_name,
            vm_name,
            vm_parameters
        )
        vm = creation_result.result()
        logger.info(f"VM '{vm.name}' created successfully.")
        return vm.id
    except Exception as e:
        logger.error(f"Failed to create VM: {e}")
        return None

def list_vms():
    try:
        vms = compute_client.virtual_machines.list(resource_group_name)
        running_vms = [vm.name for vm in vms]
        logger.info(f"Running VMs: {running_vms}")
        return running_vms
    except Exception as e:
        logger.error(f"Failed to list VMs: {e}")
        return []

def delete_vm(vm_name):
    try:
        async_vm_deletion = compute_client.virtual_machines.begin_delete(
            resource_group_name,
            vm_name
        )
        async_vm_deletion.result()  # Wait for the VM to be deleted
        logger.info(f"VM '{vm_name}' deleted successfully.")
    except Exception as e:
        logger.error(f"Failed to delete VM: {e}")

# --- Azure Blob Storage Operations ---
def create_container(storage_account_name, container_name):
    try:
        blob_service_client = BlobServiceClient(account_url=f"https://{storage_account_name}.blob.core.windows.net", credential=credential)
        container_client = blob_service_client.get_container_client(container_name)
        container_client.create_container()
        logger.info(f"Blob container '{container_name}' created successfully.")
    except Exception as e:
        logger.error(f"Failed to create Blob container: {e}")

def list_containers(storage_account_name):
    try:
        blob_service_client = BlobServiceClient(account_url=f"https://{storage_account_name}.blob.core.windows.net", credential=credential)
        containers = blob_service_client.list_containers()
        container_names = [container.name for container in containers]
        logger.info(f"Blob containers: {container_names}")
        return container_names
    except Exception as e:
        logger.error(f"Failed to list Blob containers: {e}")
        return []

def delete_container(storage_account_name, container_name):
    try:
        blob_service_client = BlobServiceClient(account_url=f"https://{storage_account_name}.blob.core.windows.net", credential=credential)
        container_client = blob_service_client.get_container_client(container_name)
        container_client.delete_container()
        logger.info(f"Blob container '{container_name}' deleted successfully.")
    except Exception as e:
        logger.error(f"Failed to delete Blob container: {e}")

def upload_file_to_blob(storage_account_name, container_name, file_name):
    try:
        blob_service_client = BlobServiceClient(account_url=f"https://{storage_account_name}.blob.core.windows.net", credential=credential)
        container_client = blob_service_client.get_container_client(container_name)
        blob_client = container_client.get_blob_client(os.path.basename(file_name))

        with open(file_name, "rb") as file:
            blob_client.upload_blob(file)
        logger.info(f"File '{file_name}' uploaded to Blob container '{container_name}' successfully.")
    except Exception as e:
        logger.error(f"Failed to upload file to Blob: {e}")

# --- Main Execution ---
if __name__ == "__main__":
    # Azure Network operations
    vnet_name = "myVNet"
    subnet_name = "mySubnet"
    nic_name = "myNIC"
    
    # Create a VNet and Subnet
    vnet = create_vnet(resource_group_name, location, vnet_name, subnet_name)
    
    # Create a Network Interface
    nic_id = create_network_interface(resource_group_name, location, vnet_name, subnet_name, nic_name)
    
    if nic_id:
        # Azure VM operations
        vm_name = 'vm1'
        image_reference = {
            "publisher": "Canonical",
            "offer": "UbuntuServer",
            "sku": "18.04-LTS"
        }
        vm_size = "Standard_B1s"
        admin_username = "USERNAME"
        admin_password = "PASSWORD"

        # Create a VM using the NIC
        vm_id = create_vm(vm_name, image_reference, vm_size, admin_username, admin_password, nic_id)

        # List all running VMs
        list_vms()

        # Delete VM if needed
        if vm_id:
            delete_vm(vm_name)

    # Azure Blob Storage operations
    storage_account_name = "TEST"
    container_name = "TEST1"
    file_to_upload = "C:/Users/aryan/Desktop/CloudComputing/aws_flask_api/index123.html"  # Replace with the actual file path

    # Create a Blob container
    create_container(storage_account_name, container_name)

    # List all containers
    list_containers(storage_account_name)

    # Upload a file to the container
    upload_file_to_blob(storage_account_name, container_name, file_to_upload)

    # Delete the container
    delete_container(storage_account_name, container_name)
