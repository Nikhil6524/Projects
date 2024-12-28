from flask import Flask, request, jsonify
from flask_cors import CORS
import azure.cognitiveservices.speech as speechsdk
import os
import tempfile
import logging
import base64

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger()

app = Flask(__name__)
CORS(app)

# Azure TTS Configuration
SUBSCRIPTION_KEY = os.getenv('AZURE_SUBSCRIPTION_KEY')
REGION = "westus2"

@app.route('/tts/synthesize', methods=['POST'])
def synthesize_speech():
    try:
        data = request.get_json()
        text = data.get('text')
        voice = data.get('voice', 'en-IN-NeerjaNeural')  # Default to Indian voice

        if not text:
            return jsonify({'error': 'No text provided'}), 400

        # Create temporary file for audio output
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.wav')
        audio_file = temp_file.name

        # Configure speech service
        speech_config = speechsdk.SpeechConfig(subscription=SUBSCRIPTION_KEY, region=REGION)
        speech_config.speech_synthesis_voice_name = voice
        
        # Configure audio output to file
        audio_config = speechsdk.audio.AudioOutputConfig(filename=audio_file)
        synthesizer = speechsdk.SpeechSynthesizer(speech_config=speech_config, audio_config=audio_config)

        # Synthesize speech
        result = synthesizer.speak_text_async(text).get()

        if result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
            # Read the audio file and convert to base64
            with open(audio_file, 'rb') as audio:
                audio_data = base64.b64encode(audio.read()).decode('utf-8')
            
            # Clean up the temporary file
            os.unlink(audio_file)
            
            return jsonify({
                'success': True,
                'audio': audio_data,
                'message': 'Speech synthesized successfully'
            })
        else:
            error_details = result.cancellation_details.error_details if result.cancellation_details else "Unknown error"
            return jsonify({
                'success': False,
                'error': f'Speech synthesis failed: {error_details}'
            }), 500

    except Exception as e:
        logger.error(f"Error in speech synthesis: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/tts/voices', methods=['GET'])
def get_available_voices():
    # List of commonly used voices
    voices = [
        {"name": "en-IN-NeerjaNeural", "language": "English (India)", "gender": "Female"},
        {"name": "en-US-JennyNeural", "language": "English (US)", "gender": "Female"},
        {"name": "en-GB-SoniaNeural", "language": "English (UK)", "gender": "Female"},
        {"name": "en-AU-NatashaNeural", "language": "English (Australia)", "gender": "Female"},
        {"name": "en-US-GuyNeural", "language": "English (US)", "gender": "Male"}
    ]
    return jsonify(voices)

if __name__ == '__main__':
    app.run(debug=True, port=5001) 