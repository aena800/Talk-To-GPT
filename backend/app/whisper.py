from flask import Flask, request, jsonify
from flask_cors import CORS
import tempfile
from transformers import pipeline
import openai
from openai import OpenAI
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*", "methods": ["POST", "OPTIONS"]}})


@app.route('/transcribe', methods=['POST'])
def transcribe_audio():
    if 'audio' not in request.files:
        return jsonify({"error": "No audio file"}), 400

    audio_file = request.files['audio']
    temp = tempfile.NamedTemporaryFile(delete=False)
    audio_file.save(temp.name)
    temp.close()

    pipe = pipeline("automatic-speech-recognition", model="openai/whisper-small")
    transcription = pipe(temp.name)

    return jsonify(transcription)


client = OpenAI(api_key=os.getenv("REACT_APP_OPENAI_API_KEY"))


@app.route('/parse-prescription', methods=['POST'])
def parse_prescription():
    data = request.json
    transcription_text = data.get("transcriptionText")
    if not transcription_text:
        return jsonify({"error": "No transcription text provided"}), 400
    
    try:
        concatenated_response = ""
        stream = client.chat.completions.create(
            model="gpt-4",
            messages=[{
                "role": "user",
                "content": f"Given this prescription text: '{transcription_text}', parse it into the following fields: medicine Name, route, frequency, direction, duration, dose unit, and instruction. Discard any irrelevant information from the text. If medicines are more than 1, make separate prescriptions for each."
            }],
            stream=True,
        )
        for chunk in stream:
            if chunk.choices[0].delta.content is not None:
                concatenated_response += chunk.choices[0].delta.content
        
        return jsonify({"parsedContent": concatenated_response})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)
