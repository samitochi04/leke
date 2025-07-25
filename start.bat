@echo off
echo Starting LEKE AI Document Assistant...
echo.

echo Installing Python dependencies...
cd back

echo Checking for virtual environment...
if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
)

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Installing dependencies in virtual environment...
pip install -r requirements.txt

echo.
echo Starting Flask backend...
echo Backend will run on http://localhost:5000
echo.
echo IMPORTANT: Make sure to:
echo 1. Add your DeepSeek API key to back/.env file
echo 2. Install Tesseract OCR (see README.md for instructions)
echo 3. Open front/index.html in your browser
echo.
python app.py

pause
