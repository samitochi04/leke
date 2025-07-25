const API_BASE_URL = 'http://localhost:5000/api';

// DOM Elements
const chatMessages = document.getElementById('chatMessages');
const chatForm = document.getElementById('chatForm');
const promptInput = document.getElementById('promptInput');
const documentInput = document.getElementById('documentInput');
const sendButton = document.getElementById('sendButton');
const loadingModal = document.getElementById('loadingModal');
const fileDropZone = document.getElementById('fileDropZone');
const fileDropContent = document.getElementById('fileDropContent');
const filePreview = document.getElementById('filePreview');
const fileName = document.getElementById('fileName');
const fileSize = document.getElementById('fileSize');

// State
let currentFile = null;
let conversations = [];

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    loadConversations();
    setupFileUpload();
});

function setupEventListeners() {
    // Form submission
    chatForm.addEventListener('submit', handleSubmit);
    
    // File input change
    documentInput.addEventListener('change', handleFileSelect);
    
    // Browse button
    const browseButton = document.getElementById('browseButton');
    if (browseButton) {
        browseButton.addEventListener('click', function() {
            documentInput.click();
        });
    }
    
    // Remove file button
    const removeFileButton = document.getElementById('removeFileButton');
    if (removeFileButton) {
        removeFileButton.addEventListener('click', removeFile);
    }
    
    // Clear history button
    const clearHistoryButton = document.getElementById('clearHistoryButton');
    if (clearHistoryButton) {
        clearHistoryButton.addEventListener('click', clearConversations);
    }
    
    // Auto-resize textarea
    promptInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = this.scrollHeight + 'px';
    });

    // Keyboard shortcuts
    promptInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    });
}

function setupFileUpload() {
    // Drag and drop events
    fileDropZone.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.classList.add('drag-over');
    });

    fileDropZone.addEventListener('dragleave', function(e) {
        e.preventDefault();
        this.classList.remove('drag-over');
    });

    fileDropZone.addEventListener('drop', function(e) {
        e.preventDefault();
        this.classList.remove('drag-over');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect({ target: { files } });
        }
    });
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
        'application/pdf',
        'image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/bmp',
        'text/csv', 'application/vnd.ms-excel'
    ];
    
    if (!allowedTypes.includes(file.type) && !file.name.toLowerCase().match(/\.(pdf|png|jpg|jpeg|gif|bmp|csv)$/)) {
        showError('Please upload a valid file (PDF, image, or CSV)');
        return;
    }

    currentFile = file;
    showFilePreview(file);
}

function showFilePreview(file) {
    fileName.textContent = file.name;
    fileSize.textContent = formatFileSize(file.size);
    
    fileDropContent.classList.add('hidden');
    filePreview.classList.remove('hidden');
    
    // Reattach event listener to remove button
    const removeFileButton = document.getElementById('removeFileButton');
    if (removeFileButton) {
        removeFileButton.addEventListener('click', removeFile);
    }
}

function removeFile() {
    currentFile = null;
    documentInput.value = '';
    
    fileDropContent.classList.remove('hidden');
    filePreview.classList.add('hidden');
    
    // Reattach event listener to browse button
    const browseButton = document.getElementById('browseButton');
    if (browseButton) {
        browseButton.addEventListener('click', function() {
            documentInput.click();
        });
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function handleSubmit(e) {
    e.preventDefault();
    
    const prompt = promptInput.value.trim();
    if (!prompt) return;

    // Show user message
    addMessage(prompt, 'user', currentFile ? currentFile.name : null);
    
    // Clear input
    promptInput.value = '';
    promptInput.style.height = 'auto';
    
    // Show loading
    showLoading();
    
    try {
        const formData = new FormData();
        formData.append('prompt', prompt);
        if (currentFile) {
            formData.append('document', currentFile);
        }

        const response = await fetch(`${API_BASE_URL}/chat`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        
        if (data.success) {
            addMessage(data.response, 'ai');
            removeFile(); // Clear file after successful submission
        } else {
            throw new Error(data.error || 'Something went wrong');
        }
    } catch (error) {
        console.error('Error:', error);
        showError(error.message || 'Failed to send message. Please try again.');
    } finally {
        hideLoading();
    }
}

function addMessage(content, sender, fileName = null) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message-bubble flex ${sender === 'user' ? 'justify-end' : 'justify-start'}`;
    
    const bubbleClass = sender === 'user' 
        ? 'bg-blue-600 text-white' 
        : 'bg-white border border-gray-200';
    
    const textClass = sender === 'user' ? 'text-white' : 'text-gray-800';
    
    messageDiv.innerHTML = `
        <div class="max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-2xl ${bubbleClass} shadow-sm">
            ${fileName ? `
                <div class="flex items-center space-x-2 mb-2 ${sender === 'user' ? 'text-blue-100' : 'text-gray-500'}">
                    <i class="fas fa-paperclip text-xs"></i>
                    <span class="text-xs font-medium">${fileName}</span>
                </div>
            ` : ''}
            <div class="${textClass}">
                ${sender === 'user' ? 
                    `<p class="text-sm">${escapeHtml(content)}</p>` : 
                    `<div class="prose prose-sm max-w-none">${formatAIResponse(content)}</div>`
                }
            </div>
            <div class="text-xs ${sender === 'user' ? 'text-blue-200' : 'text-gray-400'} mt-2">
                ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
        </div>
    `;
    
    // Remove welcome message if exists
    const welcomeMsg = chatMessages.querySelector('.text-center');
    if (welcomeMsg) {
        welcomeMsg.remove();
    }
    
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

function formatAIResponse(content) {
    // Simple markdown-like formatting
    return content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')
        .replace(/^/, '<p>')
        .replace(/$/, '</p>');
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showLoading() {
    loadingModal.classList.remove('hidden');
    sendButton.disabled = true;
}

function hideLoading() {
    loadingModal.classList.add('hidden');
    sendButton.disabled = false;
}

function showError(message) {
    addMessage(`Error: ${message}`, 'ai');
}

async function loadConversations() {
    try {
        const response = await fetch(`${API_BASE_URL}/conversations`);
        conversations = await response.json();
        
        // Display recent conversations
        conversations.slice(-5).forEach(conv => {
            if (conv.has_document) {
                addMessage(conv.prompt, 'user', 'Document attached');
            } else {
                addMessage(conv.prompt, 'user');
            }
            addMessage(conv.response, 'ai');
        });
    } catch (error) {
        console.error('Failed to load conversations:', error);
    }
}

async function clearConversations() {
    if (confirm('Are you sure you want to clear all conversations?')) {
        try {
            await fetch(`${API_BASE_URL}/conversations`, {
                method: 'DELETE'
            });
            
            // Clear UI
            chatMessages.innerHTML = `
                <div class="text-center py-8">
                    <div class="w-16 h-16 gradient-bg rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-robot text-white text-2xl"></i>
                    </div>
                    <h3 class="text-lg font-semibold text-gray-800 mb-2">Welcome to LEKE</h3>
                    <p class="text-gray-600 text-sm max-w-md mx-auto">Upload a document (PDF, image, or CSV) and ask me anything about it. I'll analyze and provide intelligent responses.</p>
                </div>
            `;
            
            conversations = [];
        } catch (error) {
            console.error('Failed to clear conversations:', error);
            showError('Failed to clear conversations');
        }
    }
}

// Auto-clear data on page reload (simulate memory-only storage)
window.addEventListener('beforeunload', function() {
    // This will clear the data when page is refreshed/closed
    fetch(`${API_BASE_URL}/conversations`, { method: 'DELETE' }).catch(() => {});
});
