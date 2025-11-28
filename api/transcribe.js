// ========================================
// SERVERLESS FUNCTION PARA VERCEL
// ========================================
const formidable = require('formidable');
const FormData = require('form-data');
const fetch = require('node-fetch');

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Validar chave da API
        if (!process.env.OPENAI_API_KEY) {
            return res.status(500).json({
                error: 'Chave da API não configurada no servidor'
            });
        }

        // Parse form data
        const form = formidable({ maxFileSize: 25 * 1024 * 1024 });
        
        const [fields, files] = await new Promise((resolve, reject) => {
            form.parse(req, (err, fields, files) => {
                if (err) reject(err);
                resolve([fields, files]);
            });
        });

        const audioFile = files.audio;
        if (!audioFile) {
            return res.status(400).json({
                error: 'Nenhum arquivo de áudio foi enviado'
            });
        }

        // Ler arquivo
        const fs = require('fs');
        const fileBuffer = fs.readFileSync(audioFile[0].filepath);

        // Criar FormData para enviar à API do Whisper
        const formData = new FormData();
        formData.append('file', fileBuffer, {
            filename: audioFile[0].originalFilename || 'audio.webm',
            contentType: audioFile[0].mimetype
        });
        formData.append('model', 'whisper-1');
        formData.append('language', fields.language?.[0] || 'pt');

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
        res.status(200).json({
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
}
