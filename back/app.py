import os
import json
import base64
import io
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
import requests
import PyPDF2
from PIL import Image
import pandas as pd
import cv2
import numpy as np
import pytesseract

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = 'uploads'
DB_FILE = 'db.json'
DEEPSEEK_API_KEY = os.getenv('DEEPSEEK_API_KEY')
DEEPSEEK_API_URL = os.getenv('DEEPSEEK_API_URL')

# Create upload folder if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def load_db():
    """Load conversations from JSON file"""
    try:
        with open(DB_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return []

def save_db(data):
    """Save conversations to JSON file"""
    with open(DB_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def extract_text_from_pdf(file_content):
    """Extract text from PDF file"""
    try:
        pdf_file = io.BytesIO(file_content)
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        return text.strip()
    except Exception as e:
        return f"Error extracting PDF text: {str(e)}"

def extract_text_from_image(file_content):
    """Extract text from image using OCR"""
    try:
        # Convert bytes to numpy array
        nparr = np.frombuffer(file_content, np.uint8)
        # Decode image
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        # Convert to RGB (pytesseract expects RGB)
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        # Extract text using OCR
        text = pytesseract.image_to_string(img_rgb)
        return text.strip()
    except Exception as e:
        return f"Error extracting image text: {str(e)}"

def extract_text_from_csv(file_content):
    """Extract text from CSV file"""
    try:
        csv_file = io.StringIO(file_content.decode('utf-8'))
        df = pd.read_csv(csv_file)
        # Convert dataframe to string representation
        text = df.to_string(index=False)
        return text
    except Exception as e:
        return f"Error extracting CSV text: {str(e)}"

def process_document(file):
    """Process uploaded document and extract text"""
    file_content = file.read()
    filename = file.filename.lower()
    
    if filename.endswith('.pdf'):
        return extract_text_from_pdf(file_content)
    elif filename.endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp')):
        return extract_text_from_image(file_content)
    elif filename.endswith('.csv'):
        return extract_text_from_csv(file_content)
    else:
        return "Unsupported file format. Please upload PDF, image, or CSV files."

def call_deepseek_api(prompt, document_text):
    """Call DeepSeek API with the prompt and document text"""
    try:
        headers = {
            'Authorization': f'Bearer {DEEPSEEK_API_KEY}',
            'Content-Type': 'application/json'
        }
        
        # Combine document text with user prompt
        combined_prompt = f"""
Document Content:
{document_text}

User Request:
{prompt}

Please analyze the document and respond to the user's request based on the document content.
"""
        
        data = {
            'model': 'deepseek-chat',
            'messages': [
                {
                    'role': 'user',
                    'content': combined_prompt
                }
            ],
            'temperature': 0.7,
            'max_tokens': 2000
        }
        
        response = requests.post(DEEPSEEK_API_URL, headers=headers, json=data)
        response.raise_for_status()
        
        result = response.json()
        return result['choices'][0]['message']['content']
    
    except Exception as e:
        return f"Error calling DeepSeek API: {str(e)}"

@app.route('/')
def index():
    """Serve the frontend"""
    return send_from_directory('../front', 'index.html')

@app.route('/api/chat', methods=['POST'])
def chat():
    """Handle chat requests with document processing"""
    try:
        # Get form data
        prompt = request.form.get('prompt', '').strip()
        
        if not prompt:
            return jsonify({'error': 'Prompt is required'}), 400
        
        document_text = ""
        
        # Process uploaded file if present
        if 'document' in request.files:
            file = request.files['document']
            if file and file.filename:
                document_text = process_document(file)
        
        # If no document, just use the prompt
        if not document_text:
            document_text = "No document provided."
        
        # Call DeepSeek API
        ai_response = call_deepseek_api(prompt, document_text)
        
        # Create conversation entry
        conversation = {
            'id': len(load_db()) + 1,
            'timestamp': datetime.now().isoformat(),
            'prompt': prompt,
            'document_text': document_text[:500] + "..." if len(document_text) > 500 else document_text,
            'response': ai_response,
            'has_document': bool(document_text and document_text != "No document provided.")
        }
        
        # Save to database
        db = load_db()
        db.append(conversation)
        save_db(db)
        
        return jsonify({
            'success': True,
            'response': ai_response,
            'conversation_id': conversation['id']
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/conversations', methods=['GET'])
def get_conversations():
    """Get all conversations"""
    return jsonify(load_db())

@app.route('/api/conversations', methods=['DELETE'])
def clear_conversations():
    """Clear all conversations"""
    save_db([])
    return jsonify({'success': True, 'message': 'All conversations cleared'})

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
