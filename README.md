# Whisper Dictation PWA

Aplicativo minimalista de ditado de voz com transcrição via API do Whisper (OpenAI).

## Recursos

- ✨ Design minimalista com tema dark
- 🎙️ Gravação de áudio com visualização de waveform dinâmica
- ⏸️ Pausar e retomar gravação
- 📤 Upload de arquivos de áudio
- 🤖 Transcrição automática via Whisper API
- 📋 Cópia automática para área de transferência
- ⌨️ Atalhos de teclado
- 📱 Progressive Web App (PWA)

## Dimensões

- **Estado Ready**: 600px × 250px
- **Estado Recording**: 600px × 250px
- **Estado Result**: 600px × 700px

## Atalhos de Teclado

- **Ctrl + Shift + R**: Iniciar/Concluir gravação
- **Ctrl + Shift + P**: Pausar/Retomar gravação

## Configuração

### 1. Obter chave da API do Whisper

1. Crie uma conta em https://platform.openai.com/
2. Vá em API Keys e crie uma nova chave
3. Copie a chave gerada

### 2. Configurar a chave no aplicativo

Abra o arquivo `app.js` e adicione sua chave na linha 29:

```javascript
const WHISPER_API_KEY = 'sua-chave-aqui';
```

### 3. Executar o aplicativo

#### Opção 1: Servidor local com Python

```bash
cd C:\Users\paulo\.a_IAs-Production\whisper-dictation-pwa
python -m http.server 8000
```

Acesse: http://localhost:8000

#### Opção 2: Servidor local com Node.js

```bash
npx http-server -p 8000
```

#### Opção 3: Live Server (VS Code)

Instale a extensão "Live Server" e clique com botão direito em `index.html` > "Open with Live Server"

## Como usar

### Gravar Áudio

1. Clique em "Gravar" ou pressione **Ctrl+Shift+R**
2. Fale no microfone (visualize a waveform)
3. Pause com **Ctrl+Shift+P** se necessário
4. Clique em "Concluir" ou pressione **Ctrl+Shift+R** novamente
5. Aguarde a transcrição
6. O texto será copiado automaticamente para área de transferência

### Upload de Arquivo

1. Clique em "Upload"
2. Selecione um arquivo de áudio
3. Aguarde a transcrição
4. O texto será copiado automaticamente

## Formatos de áudio suportados

O Whisper API suporta os seguintes formatos:
- mp3, mp4, mpeg, mpga, m4a, wav, webm

Tamanho máximo: 25 MB

## Tecnologias utilizadas

- HTML5
- CSS3 (com animações e gradientes)
- JavaScript (ES6+)
- Web Audio API (para waveform)
- MediaRecorder API (para gravação)
- Clipboard API (para copiar texto)
- Service Worker (para PWA)
- OpenAI Whisper API

## Estrutura de arquivos

```
whisper-dictation-pwa/
├── index.html          # Estrutura HTML
├── styles.css          # Estilos CSS
├── app.js             # Lógica JavaScript
├── manifest.json      # Configuração PWA
├── sw.js             # Service Worker
└── README.md         # Este arquivo
```

## Instalação como PWA

1. Abra o aplicativo no navegador
2. Clique no ícone de instalação na barra de endereços
3. Confirme a instalação
4. Use como aplicativo desktop!

## Custos da API

A API do Whisper cobra **$0.006 por minuto** de áudio transcrito.

Exemplo:
- 1 hora de áudio = $0.36
- 10 horas = $3.60

## Privacidade

- O áudio é enviado para os servidores da OpenAI para transcrição
- Não armazenamos nenhum áudio ou transcrição
- Tudo acontece no seu navegador

## Solução de problemas

### "Por favor, configure sua chave da API"
- Verifique se adicionou a chave no arquivo `app.js`

### "Erro ao acessar o microfone"
- Permita acesso ao microfone nas configurações do navegador
- Use HTTPS ou localhost (microfone só funciona em contextos seguros)

### "Erro ao transcrever áudio"
- Verifique sua chave da API
- Verifique sua conexão com internet
- Confirme que tem créditos na conta OpenAI

## Melhorias futuras

- [ ] Suporte a múltiplos idiomas
- [ ] Histórico de transcrições
- [ ] Edição de texto no próprio app
- [ ] Exportar para diferentes formatos
- [ ] Modo offline com modelo local
- [ ] Tema claro/escuro customizável

## Licença

MIT License - Use livremente!

---

Desenvolvido com ❤️ para produtividade máxima
