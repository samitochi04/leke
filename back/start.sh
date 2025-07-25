#!/bin/bash

echo "Starting LEKE AI Document Assistant..."
echo

# Check if we're in a virtual environment
if [[ "$VIRTUAL_ENV" == "" ]]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
    
    echo "Activating virtual environment..."
    source venv/bin/activate
else
    echo "Virtual environment already active: $VIRTUAL_ENV"
fi

echo "Installing Python dependencies..."
pip install -r requirements.txt

echo
echo "Starting Flask backend..."
echo "Backend will run on http://localhost:5000"
echo
echo "IMPORTANT: Make sure to:"
echo "1. Add your DeepSeek API key to .env file"
echo "2. Install Tesseract OCR: sudo apt-get install tesseract-ocr"
echo "3. Open front/index.html in your browser"
echo

python app.py
