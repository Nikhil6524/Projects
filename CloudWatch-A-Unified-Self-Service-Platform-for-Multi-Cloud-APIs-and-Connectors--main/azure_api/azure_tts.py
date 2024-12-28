import logging
import os
import json
from azure.identity import AzureCliCredential
from azure.mgmt.compute import ComputeManagementClient
from azure.mgmt.resource import ResourceManagementClient
from azure.mgmt.storage import StorageManagementClient
from azure.mgmt.network import NetworkManagementClient
import azure.cognitiveservices.speech as speechsdk

# Configure logging to a file
logging.basicConfig(filename='azure_operations.log', level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger()

# Use Azure CLI to authenticate
credential = AzureCliCredential()

# Replace these with your actual Azure details
subscription_id = ""  # Set your Azure subscription ID
resource_group_name = ''
location = 'West US 2'  # Use the region of your VM

# Initialize the Azure management clients
resource_client = ResourceManagementClient(credential, subscription_id)
compute_client = ComputeManagementClient(credential, subscription_id)
storage_client = StorageManagementClient(credential, subscription_id)
network_client = NetworkManagementClient(credential, subscription_id)

# --- Azure Text-to-Speech Operation ---
def text_to_speech(text, subscription_key, region):
    try:
        speech_config = speechsdk.SpeechConfig(subscription=subscription_key, region=region)
        speech_config.speech_synthesis_voice_name = "en-IN-NeerjaNeural"  # Set to Indian voice
        audio_config = speechsdk.audio.AudioOutputConfig(use_default_speaker=True)

        # Create a speech synthesizer
        synthesizer = speechsdk.SpeechSynthesizer(speech_config=speech_config, audio_config=audio_config)

        # Synthesize the provided text
        result = synthesizer.speak_text_async(text).get()

        # Check result
        if result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
            logger.info("Speech synthesized for text: " + text)
            print("Speech synthesized for text: " + text)
        elif result.reason == speechsdk.ResultReason.Canceled:
            cancellation_details = result.cancellation_details
            logger.error(f"Speech synthesis canceled: {cancellation_details.reason}")
            print(f"Speech synthesis canceled: {cancellation_details.reason}")
            if cancellation_details.error_details:
                logger.error(f"Error details: {cancellation_details.error_details}")
                print(f"Error details: {cancellation_details.error_details}")
    except Exception as e:
        logger.error(f"Failed to synthesize speech: {e}")
        print(f"Failed to synthesize speech: {e}")

# --- Main Execution ---
if __name__ == "__main__":
    # Azure Text-to-Speech operation
    text = "Hello Mera Naam Rahul Hai"
    subscription_key = ""
    region = "westus2"
    text_to_speech(text, subscription_key, region)
