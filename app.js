// ========================================
// STATE MANAGEMENT
// ========================================
let mediaRecorder = null;
let audioChunks = [];
let audioContext = null;
let analyser = null;
let animationId = null;
let startTime = null;
let timerInterval = null;
let isPaused = false;
let quillEditor = null;

// ========================================
// DOM ELEMENTS
// ========================================
const app = document.getElementById('app');
const readyState = document.getElementById('ready-state');
const recordingState = document.getElementById('recording-state');
const processingState = document.getElementById('processing-state');
const resultState = document.getElementById('result-state');

const recordBtn = document.getElementById('record-btn');
const uploadBtn = document.getElementById('upload-btn');
const finishBtn = document.getElementById('finish-btn');
const pauseBtn = document.getElementById('pause-btn');
const copyBtn = document.getElementById('copy-btn');
const newBtn = document.getElementById('new-btn');
const fileInput = document.getElementById('file-input');
const languageSelect = document.getElementById('language-select');

const exportMarkdownBtn = document.getElementById('export-markdown-btn');
const exportPdfBtn = document.getElementById('export-pdf-btn');
const exportWordBtn = document.getElementById('export-word-btn');

const waveformCanvas = document.getElementById('waveform');
const ctx = waveformCanvas.getContext('2d');
const recordingTime = document.getElementById('recording-time');
const copiedBadge = document.getElementById('copied-badge');
const toastContainer = document.getElementById('toast-container');

const shortcutsModal = document.getElementById('shortcuts-modal');
const closeShortcutsBtn = document.getElementById('close-shortcuts');

// ========================================
// API CONFIGURATION
// ========================================
// A chave da API é mantida segura no servidor backend
// Nunca exponha chaves de API no frontend!
const API_BASE_URL = window.location.origin; // URL do servidor backend
const TRANSCRIBE_ENDPOINT = '/api/transcribe';

// ========================================
// RIPPLE EFFECT
// ========================================
function createRipple(event) {
    const button = event.currentTarget;
    button.classList.add('ripple');

    setTimeout(() => {
        button.classList.remove('ripple');
    }, 600);
}

// Add ripple effect to all buttons
document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', createRipple);
});

// ========================================
// TOAST NOTIFICATIONS
// ========================================
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');

    toastContainer.classList.remove('visually-hidden');
    toastContainer.appendChild(toast);

    // Animate in
    setTimeout(() => toast.classList.add('show'), 10);

    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toastContainer.removeChild(toast);
            if (toastContainer.children.length === 0) {
                toastContainer.classList.add('visually-hidden');
            }
        }, 300);
    }, 3000);
}

// ========================================
// STATE MANAGEMENT
// ========================================
function setState(state) {
    app.className = `app-container state-${state}`;

    readyState.classList.add('hidden');
    recordingState.classList.add('hidden');
    processingState.classList.add('hidden');
    resultState.classList.add('hidden');

    switch(state) {
        case 'ready':
            readyState.classList.remove('hidden');
            resetRecordingUI();
            break;
        case 'recording':
            recordingState.classList.remove('hidden');
            break;
        case 'processing':
            processingState.classList.remove('hidden');
            break;
        case 'result':
            resultState.classList.remove('hidden');
            animateSuccess();
            break;
    }
}

function resetRecordingUI() {
    recordingTime.textContent = '00:00';
    updateRingProgress(0);
}

// ========================================
// SUCCESS ANIMATION
// ========================================
function animateSuccess() {
    // Add success animation class to result state
    resultState.style.animation = 'fadeInUp 400ms cubic-bezier(0.19, 1, 0.22, 1)';
}

// ========================================
// RING PROGRESS UPDATE
// ========================================
function updateRingProgress(seconds) {
    const ringFill = document.querySelector('.ring-fill');
    if (!ringFill) return;

    // Calculate progress (max 60 seconds for full circle)
    const maxSeconds = 60;
    const progress = Math.min(seconds / maxSeconds, 1);
    const circumference = 2 * Math.PI * 36; // radius = 36
    const offset = circumference * (1 - progress);

    ringFill.style.strokeDashoffset = offset;
}

// ========================================
// RECORDING FUNCTIONS
// ========================================
async function startRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        // Configure MediaRecorder
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];

        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };

        mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            await transcribeAudio(audioBlob);

            // Stop all tracks
            stream.getTracks().forEach(track => track.stop());
            stopWaveform();
        };

        // Configure audio visualization
        audioContext = new AudioContext();
        analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);
        analyser.fftSize = 256;

        // Start recording
        mediaRecorder.start();
        isPaused = false;
        startTime = Date.now();
        startTimer();
        drawWaveform();
        setState('recording');

    } catch (error) {
        console.error('Error accessing microphone:', error);
        showToast('Erro ao acessar o microfone. Verifique as permissões.', 'error');
    }
}

// ========================================
// PAUSE/RESUME RECORDING
// ========================================
function togglePause() {
    if (!mediaRecorder) return;

    if (isPaused) {
        mediaRecorder.resume();
        startTimer();
        drawWaveform();
        pauseBtn.innerHTML = `
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <rect x="6" y="4" width="4" height="16"/>
                <rect x="14" y="4" width="4" height="16"/>
            </svg>
            <span>Pausar</span>
        `;
        pauseBtn.setAttribute('aria-label', 'Pausar gravação. Atalho de teclado: Ctrl+Shift+P');
        pauseBtn.setAttribute('aria-pressed', 'false');
    } else {
        mediaRecorder.pause();
        stopTimer();
        stopWaveform();
        pauseBtn.innerHTML = `
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            <span>Retomar</span>
        `;
        pauseBtn.setAttribute('aria-label', 'Retomar gravação');
        pauseBtn.setAttribute('aria-pressed', 'true');
    }

    isPaused = !isPaused;
}

// ========================================
// FINISH RECORDING
// ========================================
function finishRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        stopTimer();
        mediaRecorder.stop();
        setState('processing');
    }
}

// ========================================
// TIMER FUNCTIONS
// ========================================
function startTimer() {
    timerInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        recordingTime.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        // Update ring progress
        const totalSeconds = minutes * 60 + seconds;
        updateRingProgress(totalSeconds);
    }, 100);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

// ========================================
// COLORFUL WAVEFORM VISUALIZATION
// ========================================
function drawWaveform() {
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function draw() {
        animationId = requestAnimationFrame(draw);

        analyser.getByteTimeDomainData(dataArray);

        // Clear canvas
        ctx.fillStyle = '#0f0f0f';
        ctx.fillRect(0, 0, waveformCanvas.width, waveformCanvas.height);

        // Create gradient based on amplitude
        const avgAmplitude = dataArray.reduce((sum, val) => sum + Math.abs(val - 128), 0) / bufferLength;
        const normalizedAmplitude = avgAmplitude / 128;

        // Create colorful gradient
        const gradient = ctx.createLinearGradient(0, 0, waveformCanvas.width, 0);

        if (normalizedAmplitude > 0.3) {
            // High amplitude - vibrant colors
            gradient.addColorStop(0, '#667eea');
            gradient.addColorStop(0.33, '#764ba2');
            gradient.addColorStop(0.66, '#f093fb');
            gradient.addColorStop(1, '#38ef7d');
        } else if (normalizedAmplitude > 0.15) {
            // Medium amplitude
            gradient.addColorStop(0, '#667eea');
            gradient.addColorStop(0.5, '#764ba2');
            gradient.addColorStop(1, '#f093fb');
        } else {
            // Low amplitude
            gradient.addColorStop(0, '#667eea');
            gradient.addColorStop(1, '#764ba2');
        }

        // Draw waveform
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = gradient;
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(102, 126, 234, 0.5)';
        ctx.beginPath();

        const sliceWidth = waveformCanvas.width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] / 128.0;
            const y = v * waveformCanvas.height / 2;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }

            x += sliceWidth;
        }

        ctx.lineTo(waveformCanvas.width, waveformCanvas.height / 2);
        ctx.stroke();

        // Reset shadow
        ctx.shadowBlur = 0;
    }

    draw();
}

function stopWaveform() {
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
}

// ========================================
// WHISPER API TRANSCRIPTION (via Backend Seguro)
// ========================================
async function transcribeAudio(audioBlob) {
    try {
        // Pegar idioma selecionado
        const selectedLanguage = languageSelect.value;
        
        // Criar FormData com o arquivo de áudio
        const formData = new FormData();
        formData.append('audio', audioBlob, 'audio.webm');
        formData.append('language', selectedLanguage);

        // Enviar para o servidor backend (que mantém a chave segura)
        const response = await fetch(`${API_BASE_URL}${TRANSCRIBE_ENDPOINT}`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Erro na transcrição: ${response.status}`);
        }

        const data = await response.json();
        showResult(data.text);

    } catch (error) {
        console.error('Transcription error:', error);
        showToast(error.message || 'Erro ao transcrever áudio. Verifique o servidor.', 'error');
        setState('ready');
    }
}

// ========================================
// SHOW RESULT
// ========================================
function showResult(text) {
    // Inicializar Quill editor se não existir
    if (!quillEditor) {
        quillEditor = new Quill('#transcription-editor', {
            theme: 'snow',
            placeholder: 'A transcrição aparecerá aqui...',
            modules: {
                toolbar: [
                    ['bold', 'italic', 'underline'],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    ['clean']
                ]
            }
        });
    }
    
    // Inserir texto transcrito
    quillEditor.setText(text);
    setState('result');

    // Auto-copy to clipboard em formato Markdown
    const markdown = quillToMarkdown();
    copyToClipboard(markdown, true);
}

// ========================================
// QUILL TO MARKDOWN CONVERTER
// ========================================
function quillToMarkdown() {
    const delta = quillEditor.getContents();
    let markdown = '';
    let currentLine = '';
    
    delta.ops.forEach((op, index) => {
        if (typeof op.insert === 'string') {
            let text = op.insert;
            
            // Apply formatting
            if (op.attributes) {
                if (op.attributes.bold) {
                    text = `**${text}**`;
                }
                if (op.attributes.italic) {
                    text = `*${text}*`;
                }
                if (op.attributes.underline) {
                    text = `__${text}__`;
                }
            }
            
            currentLine += text;
            
            // Check for newlines
            if (text.includes('\n')) {
                const lines = currentLine.split('\n');
                lines.forEach((line, i) => {
                    if (i > 0) markdown += '\n';
                    if (line.trim()) markdown += line;
                });
                currentLine = '';
            }
        }
    });
    
    if (currentLine.trim()) {
        markdown += currentLine;
    }
    
    return markdown.trim();
}

// ========================================
// EXPORT FUNCTIONS
// ========================================
async function exportAsMarkdown() {
    const markdown = quillToMarkdown();
    const blob = new Blob([markdown], { type: 'text/markdown' });
    downloadFile(blob, 'transcricao.md');
    showToast('Exportado como Markdown!', 'success');
}

async function exportAsPDF() {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        const text = quillEditor.getText();
        const lines = doc.splitTextToSize(text, 180);
        
        doc.setFont('helvetica');
        doc.setFontSize(12);
        doc.text(lines, 15, 20);
        
        doc.save('transcricao.pdf');
        showToast('Exportado como PDF!', 'success');
    } catch (error) {
        console.error('PDF export error:', error);
        showToast('Erro ao exportar PDF', 'error');
    }
}

async function exportAsWord() {
    try {
        const { Document, Packer, Paragraph, TextRun } = docx;
        
        const text = quillEditor.getText();
        const paragraphs = text.split('\n').filter(p => p.trim()).map(p => 
            new Paragraph({
                children: [new TextRun(p)]
            })
        );
        
        const doc = new Document({
            sections: [{
                properties: {},
                children: paragraphs
            }]
        });
        
        const blob = await Packer.toBlob(doc);
        downloadFile(blob, 'transcricao.docx');
        showToast('Exportado como Word!', 'success');
    } catch (error) {
        console.error('Word export error:', error);
        showToast('Erro ao exportar Word', 'error');
    }
}

function downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ========================================
// CLIPBOARD FUNCTIONS
// ========================================
async function copyToClipboard(text = null, auto = false) {
    try {
        const textToCopy = text || quillToMarkdown();
        await navigator.clipboard.writeText(textToCopy);

        if (!auto) {
            copiedBadge.classList.add('show');
            setTimeout(() => {
                copiedBadge.classList.remove('show');
            }, 2000);
            showToast('Copiado como Markdown!', 'success');
        }
    } catch (error) {
        console.error('Copy error:', error);
        showToast('Erro ao copiar para área de transferência', 'error');
    }
}

// ========================================
// FILE UPLOAD
// ========================================
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('audio/')) {
        showToast('Por favor, selecione um arquivo de áudio válido', 'error');
        return;
    }

    setState('processing');
    transcribeAudio(file);
}

// ========================================
// KEYBOARD SHORTCUTS
// ========================================
document.addEventListener('keydown', (e) => {
    // Ctrl+Shift+R - Start/Finish recording
    if (e.ctrlKey && e.shiftKey && e.key === 'R') {
        e.preventDefault();
        if (app.classList.contains('state-ready')) {
            startRecording();
        } else if (app.classList.contains('state-recording')) {
            finishRecording();
        }
    }

    // Ctrl+Shift+P - Pause/Resume
    // Ctrl+Shift+D - Export PDF (in result state)
    if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        if (app.classList.contains('state-recording')) {
            togglePause();
        }
    }

    if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        if (app.classList.contains('state-result')) {
            exportAsPDF();
        }
    }

    // Escape - Return to ready state (from result)
    if (e.key === 'Escape' && app.classList.contains('state-result')) {
        e.preventDefault();
        setState('ready');
    }

    // Ctrl+Shift+C - Copy edited text (in result state)
    if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        if (app.classList.contains('state-result')) {
            copyToClipboard();
        }
    }

    // Ctrl+E - Export as Markdown
    if (e.ctrlKey && e.key === 'e') {
        e.preventDefault();
        if (app.classList.contains('state-result')) {
            exportAsMarkdown();
        }
    }

    // Ctrl+Shift+W - Export as Word
    if (e.ctrlKey && e.shiftKey && e.key === 'W') {
        e.preventDefault();
        if (app.classList.contains('state-result')) {
            exportAsWord();
        }
    }

    // Ctrl+N - New recording (from result)
    if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        if (app.classList.contains('state-result')) {
            setState('ready');
        }
    }

    // Ctrl+/ or Ctrl+H - Show keyboard shortcuts
    if ((e.ctrlKey && e.key === '/') || (e.ctrlKey && e.key === 'h')) {
        e.preventDefault();
        shortcutsModal.classList.remove('hidden');
    }

    // Escape - Close shortcuts modal (if open) OR return to ready
    if (e.key === 'Escape') {
        if (!shortcutsModal.classList.contains('hidden')) {
            e.preventDefault();
            shortcutsModal.classList.add('hidden');
        } else if (app.classList.contains('state-result')) {
            e.preventDefault();
            setState('ready');
        }
    }
});

// ========================================
// EVENT LISTENERS
// ========================================
recordBtn.addEventListener('click', startRecording);
uploadBtn.addEventListener('click', () => fileInput.click());
finishBtn.addEventListener('click', finishRecording);
pauseBtn.addEventListener('click', togglePause);
copyBtn.addEventListener('click', () => copyToClipboard());
newBtn.addEventListener('click', () => setState('ready'));
fileInput.addEventListener('change', handleFileUpload);

// Export buttons
exportMarkdownBtn.addEventListener('click', exportAsMarkdown);
exportPdfBtn.addEventListener('click', exportAsPDF);
exportWordBtn.addEventListener('click', exportAsWord);

// Shortcuts modal
closeShortcutsBtn.addEventListener('click', () => {
    shortcutsModal.classList.add('hidden');
});

shortcutsModal.addEventListener('click', (e) => {
    if (e.target === shortcutsModal) {
        shortcutsModal.classList.add('hidden');
    }
});

// ========================================
// SERVICE WORKER REGISTRATION (PWA)
// ========================================
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
        .then(reg => console.log('Service Worker registered:', reg))
        .catch(err => console.log('Service Worker registration failed:', err));
}

// ========================================
// WINDOW SIZE MANAGEMENT FOR PWA
// ========================================
function managePWAWindowSize() {
    // Check if running as PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
        // Set window size on load
        const currentState = app.className.split(' ')[1];

        if (currentState === 'state-ready' ||
            currentState === 'state-recording' ||
            currentState === 'state-processing') {
            // Try to resize window (works in some PWA environments)
            if (window.resizeTo) {
                window.resizeTo(600, 350);
            }
        }
    }
}

// Call on load
window.addEventListener('load', managePWAWindowSize);

// ========================================
// ACCESSIBILITY ENHANCEMENTS
// ========================================

// Announce state changes to screen readers
const announcer = document.createElement('div');
announcer.setAttribute('role', 'status');
announcer.setAttribute('aria-live', 'polite');
announcer.className = 'visually-hidden';
document.body.appendChild(announcer);

function announceToScreenReader(message) {
    announcer.textContent = message;
    setTimeout(() => announcer.textContent = '', 1000);
}

// Override setState to include announcements
const originalSetState = setState;
setState = function(state) {
    originalSetState(state);

    const announcements = {
        'ready': 'Pronto para gravar',
        'recording': 'Gravação iniciada',
        'processing': 'Processando transcrição',
        'result': 'Transcrição concluída'
    };

    if (announcements[state]) {
        announceToScreenReader(announcements[state]);
    }
};

// ========================================
// PERFORMANCE OPTIMIZATION
// ========================================

// Use passive event listeners for better scroll performance
document.addEventListener('touchstart', () => {}, { passive: true });
document.addEventListener('touchmove', () => {}, { passive: true });

// Preload audio context on first user interaction
let audioContextReady = false;
document.addEventListener('click', () => {
    if (!audioContextReady && !audioContext) {
        audioContextReady = true;
    }
}, { once: true });

console.log('%c🎙️ Whisper Dictation Premium', 'color: #667eea; font-size: 16px; font-weight: bold;');
console.log('%cPWA com transcrição de áudio premium', 'color: #999; font-size: 12px;');
