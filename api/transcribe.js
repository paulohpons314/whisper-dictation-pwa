// ========================================
// SERVERLESS FUNCTION PARA VERCEL
// ========================================
const formidable = require('formidable');
const FormData = require('form-data');
const fetch = require('node-fetch');
const fs = require('fs');

module.exports = async function handler(req, res) {
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

        // Parse form data com callback style
        const form = formidable({ 
            maxFileSize: 25 * 1024 * 1024,
            multiples: false
        });
        
        form.parse(req, async (err, fields, files) => {
            if (err) {
                console.error('Form parse error:', err);
                return res.status(500).json({
                    error: 'Erro ao processar upload',
                    message: err.message
                });
            }

            try {
                // Pegar arquivo (formidable v3 retorna arrays)
                const audioFile = files.audio?.[0] || files.audio;
                
                if (!audioFile) {
                    return res.status(400).json({
                        error: 'Nenhum arquivo de áudio foi enviado'
                    });
                }

                // Ler arquivo
                const fileBuffer = fs.readFileSync(audioFile.filepath);

                // Criar FormData para enviar à API do Whisper
                const formData = new FormData();
                formData.append('file', fileBuffer, {
                    filename: audioFile.originalFilename || 'audio.webm',
                    contentType: audioFile.mimetype
                });
                formData.append('model', 'whisper-1');
                
                // Pegar idioma (formidable v3 retorna arrays)
                const language = fields.language?.[0] || fields.language || 'pt';
                formData.append('language', language);

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
                console.error('Erro ao processar:', error);
                res.status(500).json({
                    error: 'Erro ao processar transcrição',
                    message: error.message
                });
            }
        });

    } catch (error) {
        console.error('Erro no servidor:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            message: error.message
        });
    }
};
