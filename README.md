# LEKE - AI Document Assistant

A beautiful AI-powered web application that processes documents (PDFs, images, CSV files) and provides intelligent responses to user queries using DeepSeek API.

## Features

- 📄 **Multi-format Document Support**: Upload PDFs, images (PNG, JPG, etc.), and CSV files
- 🤖 **AI-powered Analysis**: Powered by DeepSeek API for intelligent document analysis
- 💬 **Interactive Chat Interface**: Apple-inspired UI with smooth animations
- 🗃️ **Temporary Storage**: Conversations stored in memory, cleared on page reload
- 🎨 **Beautiful Design**: Modern, responsive design inspired by Apple's design principles

## Tech Stack

### Backend
- **Flask**: Python web framework
- **DeepSeek API**: AI processing
- **PyPDF2**: PDF text extraction
- **OpenCV + Tesseract**: OCR for images
- **Pandas**: CSV processing
- **Flask-CORS**: Cross-origin requests

### Frontend
- **HTML/CSS/JavaScript**: Pure frontend
- **Tailwind CSS**: Utility-first CSS framework
- **Font Awesome**: Icon library
- **Apple-inspired UX/UI**: Smooth transitions and modern design

## Setup Instructions

### 1. Backend Setup

```bash
# Navigate to backend directory
cd back

# Install Python dependencies
pip install -r requirements.txt

# Set up environment variables
# Edit .env file and add your DeepSeek API key:
DEEPSEEK_API_KEY=your_deepseek_api_key_here
DEEPSEEK_API_URL=https://api.deepseek.com/v1/chat/completions
```

### 2. Install Tesseract (for OCR)

**Windows:**
- Download and install from: https://github.com/UB-Mannheim/tesseract/wiki
- Add Tesseract to your PATH

**macOS:**
```bash
brew install tesseract
```

**Linux:**
```bash
sudo apt-get install tesseract-ocr
```

### 3. Run the Application

```bash
# Start the Flask backend
cd back
python app.py

# The backend will run on http://localhost:5000
# Open front/index.html in your browser or serve it via a local server
```

### 4. Frontend Access

Open `front/index.html` in your web browser or use a local server:

```bash
# Using Python's built-in server
cd front
python -m http.server 8080

# Then visit http://localhost:8080
```

## Usage

1. **Upload Document**: Drag and drop or click to browse for PDF, image, or CSV files
2. **Ask Questions**: Type your question or request about the document
3. **Get AI Response**: The AI will analyze your document and provide intelligent answers
4. **Chat History**: View conversation history (cleared on page reload)

## API Endpoints

- `POST /api/chat` - Send message with optional document
- `GET /api/conversations` - Get all conversations
- `DELETE /api/conversations` - Clear all conversations
- `GET /api/health` - Health check

## Environment Variables

- `DEEPSEEK_API_KEY` - Your DeepSeek API key
- `DEEPSEEK_API_URL` - DeepSeek API endpoint URL

## File Structure

```
leke/
├── back/
│   ├── app.py              # Flask application
│   ├── requirements.txt    # Python dependencies
│   ├── .env               # Environment variables
│   ├── db.json            # Temporary database
│   └── uploads/           # File upload directory
├── front/
│   ├── index.html         # Main HTML file
│   └── script.js          # JavaScript functionality
└── README.md              # This file
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details
