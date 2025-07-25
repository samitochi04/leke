# Quick Setup Guide

## For Linux/WSL/macOS:

1. **Navigate to the backend directory:**
   ```bash
   cd back
   ```

2. **Create and activate virtual environment:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Install Tesseract OCR:**
   ```bash
   # Ubuntu/Debian
   sudo apt-get install tesseract-ocr
   
   # macOS
   brew install tesseract
   ```

5. **Set up environment variables:**
   ```bash
   # Edit the .env file and add your DeepSeek API key
   nano .env
   ```

6. **Run the application:**
   ```bash
   python app.py
   ```

7. **Open frontend:**
   Open `front/index.html` in your browser

## For Windows:

1. **Run the batch file:**
   ```cmd
   start.bat
   ```

Or manually:

1. **Navigate to backend:**
   ```cmd
   cd back
   ```

2. **Create virtual environment:**
   ```cmd
   python -m venv venv
   venv\Scripts\activate.bat
   ```

3. **Install dependencies:**
   ```cmd
   pip install -r requirements.txt
   ```

4. **Install Tesseract:**
   Download from: https://github.com/UB-Mannheim/tesseract/wiki

5. **Run application:**
   ```cmd
   python app.py
   ```

## Quick Commands for Your Current Situation:

Since you're in the back directory already, run these commands:

```bash
# Create virtual environment
python3 -m venv venv

# Activate it
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Install Tesseract (if not already installed)
sudo apt-get install tesseract-ocr

# Run the app
python app.py
```
