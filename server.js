// ========================================
// SERVIDOR BACKEND SEGURO PARA WHISPER API
// ========================================
// Este servidor mantém a chave da API segura no backend
// O frontend nunca tem acesso direto à chave

require('dotenv').config();
const express = require('express');
const multer = require('multer');
const FormData = require('form-data');
const fetch = require('node-fetch');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Log para debug
console.log('🔐 API Key configured:', !!process.env.OPENAI_API_KEY);
console.log('📂 Serving from:', __dirname);

// Configurar multer para upload de arquivos
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 25 * 1024 * 1024 // 25MB (limite do Whisper API)
    },
    fileFilter: (req, file, cb) => {
        // Aceitar apenas arquivos de áudio
        if (file.mimetype.startsWith('audio/')) {
            cb(null, true);
        } else {
            cb(new Error('Apenas arquivos de áudio são permitidos'));
        }
    }
});

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// ========================================
// ROTA PRINCIPAL - Servir o app
// ========================================
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ========================================
// ROTA DE TRANSCRIÇÃO - Protegida
// ========================================
app.post('/api/transcribe', upload.single('audio'), async (req, res) => {
    try {
        // Validar chave da API
        if (!process.env.OPENAI_API_KEY) {
            return res.status(500).json({
                error: 'Chave da API não configurada no servidor'
            });
        }

        // Validar arquivo
        if (!req.file) {
            return res.status(400).json({
                error: 'Nenhum arquivo de áudio foi enviado'
            });
        }

        // Criar FormData para enviar à API do Whisper
        const formData = new FormData();
        formData.append('file', req.file.buffer, {
            filename: req.file.originalname || 'audio.webm',
            contentType: req.file.mimetype
        });
        formData.append('model', 'whisper-1');
        formData.append('language', req.body.language || 'pt');

        // Fazer requisição à API do Whisper
        const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                ...formData.getHeaders()
            },
            body: formData
        });

        // Verificar resposta
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Erro da API Whisper:', errorData);

            return res.status(response.status).json({
                error: errorData.error?.message || 'Erro ao transcrever áudio',
                details: errorData
            });
        }

        // Retornar transcrição
        const data = await response.json();
        res.json({
            text: data.text,
            duration: data.duration
        });

    } catch (error) {
        console.error('Erro no servidor:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            message: error.message
        });
    }
});

// ========================================
// ROTA DE SAÚDE (Health Check)
// ========================================
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        apiConfigured: !!process.env.OPENAI_API_KEY,
        timestamp: new Date().toISOString()
    });
});

// ========================================
// INICIAR SERVIDOR
// ========================================
const server = app.listen(PORT, () => {
    console.log('╔════════════════════════════════════════╗');
    console.log('║  🎙️  Whisper Dictation Server         ║');
    console.log('╠════════════════════════════════════════╣');
    console.log(`║  🌐 Server: http://localhost:${PORT}     ║`);
    console.log(`║  🔐 API Key: ${process.env.OPENAI_API_KEY ? '✓ Configured' : '✗ Missing'}       ║`);
    console.log('╚════════════════════════════════════════╝');
    console.log('');
    console.log('📝 Endpoints disponíveis:');
    console.log(`   GET  / - Aplicativo web`);
    console.log(`   POST /api/transcribe - Transcrição de áudio`);
    console.log(`   GET  /api/health - Status do servidor`);
    console.log('');
    console.log('⚡ Servidor rodando! Pressione Ctrl+C para parar.');
});

// Export for serverless (Vercel)
module.exports = app;

// Tratamento de erros global
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({
                error: 'Arquivo muito grande. Tamanho máximo: 25MB'
            });
        }
    }

    res.status(500).json({
        error: 'Erro no servidor',
        message: error.message
    });
});
