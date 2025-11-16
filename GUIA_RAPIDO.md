# Guia Rápido - Whisper Dictation Premium

## Início Rápido

### 1. Configurar API Key
Crie um arquivo `.env` na raiz do projeto (copie de `.env.example`):

```bash
OPENAI_API_KEY=sk-proj-sua-chave-aqui
PORT=3000
```

### 2. Instalar Dependências
```bash
npm install
```

### 3. Iniciar o Servidor
```bash
npm start
```

### 4. Acessar
Abra no navegador: `http://localhost:3000`

---

## Recursos Premium Implementados

### Visuais
- Waveform colorido dinâmico (muda cor com amplitude)
- Ring progress circular ao redor do timer
- Indicador de gravação pulsante (ponto vermelho)
- Animações suaves em todas as transições
- Ripple effect nos botões
- Toast notifications elegantes
- Gradientes animados
- Glassmorphism sutil

### Interações
- **Ctrl+Shift+R**: Iniciar/Finalizar gravação
- **Ctrl+Shift+P**: Pausar/Retomar gravação
- **Escape**: Voltar ao início
- **Ripple** em todos os cliques
- **Tooltips** em todos os botões (hover)

### Acessibilidade
- ARIA labels completos
- Screen reader support
- Focus states WCAG AAA
- Keyboard navigation
- High contrast support
- Reduced motion support

### PWA
- Instalável como app standalone
- File handlers (abre arquivos de áudio)
- Share target (recebe arquivos compartilhados)
- Shortcuts no menu
- Window controls overlay

---

## Fluxo de Uso

### Gravação
1. Clique em **Gravar** (ou Ctrl+Shift+R)
2. Permita acesso ao microfone
3. Veja o waveform colorido em tempo real
4. Timer com ring progress mostra duração
5. **Pausar** (Ctrl+Shift+P) se necessário
6. **Concluir** para transcrever

### Upload
1. Clique em **Upload**
2. Selecione arquivo de áudio (.wav, .mp3, .webm, etc)
3. Aguarde processamento
4. Veja resultado

### Resultado
- Texto é **copiado automaticamente**
- Badge "Copiado!" aparece brevemente
- Botão **Copiar** para copiar novamente
- **Nova Gravação** para recomeçar

---

## Animações e Efeitos

### Waveform Colorido
- **Baixa amplitude**: Gradiente azul-roxo (2 cores)
- **Média amplitude**: Gradiente azul-roxo-rosa (3 cores)
- **Alta amplitude**: Gradiente completo azul-roxo-rosa-verde (4 cores)
- **Shadow blur**: Sombra colorida acompanha gradiente

### Ring Progress
- Anel circular ao redor do timer
- Completa em 60 segundos
- Gradiente azul → roxo
- Animação suave (300ms transitions)

### Recording Indicator
- Ponto vermelho pulsante
- Posicionado no canto superior direito
- Animação pulse (1.5s loop)
- Box-shadow expansivo

### Botões
- **Hover**: Lift effect (-2px translateY)
- **Click**: Ripple effect (600ms)
- **Focus**: Outline 3px offset (WCAG AAA)
- **Icon**: Scale 1.1 no hover

### Toast Notifications
- **Slide-in**: Da direita para esquerda
- **Auto-dismiss**: 3 segundos
- **3 Tipos**: Error (vermelho), Success (verde), Info (azul)
- **Stacking**: Múltiplos toasts empilhados

---

## Design System

### Cores
```css
Primary:   #667eea → #764ba2 (gradiente)
Success:   #11998e → #38ef7d
Warning:   #f093fb → #f5576c
Recording: #ef476f (vermelho)
Background: #0a0a0a, #1a1a1a, #0f0f0f
Text:      #e0e0e0, #999
```

### Espaçamentos
```css
xs:  8px
sm:  12px
md:  16px
lg:  24px
xl:  32px
2xl: 40px
```

### Transições
```css
Fast:   150ms
Normal: 250ms
Slow:   400ms
```

### Easing
```css
ease-out-expo:     cubic-bezier(0.19, 1, 0.22, 1)
ease-in-out-back:  cubic-bezier(0.68, -0.55, 0.265, 1.55)
ease-spring:       cubic-bezier(0.4, 0, 0.2, 1)
```

---

## Estrutura de Estados

### 1. Ready (250px)
```
┌─────────────────────────┐
│                         │
│    [Gravar] [Upload]    │
│                         │
└─────────────────────────┘
```

### 2. Recording (250px)
```
┌─────────────────────────┐
│         🔴              │ ← Recording indicator
│   ╱╲╱╲╱╲╱╲╱╲╱╲╱╲       │ ← Waveform colorido
│      ⭕ 00:42           │ ← Timer + Ring
│  [Concluir] [Pausar]   │
└─────────────────────────┘
```

### 3. Processing (250px)
```
┌─────────────────────────┐
│                         │
│         ⚙️              │ ← Spinner
│  Transcrevendo áudio... │
└─────────────────────────┘
```

### 4. Result (700px)
```
┌─────────────────────────┐
│ Transcrição   [Copiado!]│
│ ┌─────────────────────┐ │
│ │                     │ │
│ │  Texto transcrito   │ │ ← Textarea
│ │  aparece aqui...    │ │
│ │                     │ │
│ └─────────────────────┘ │
│ [Copiar] [Nova Gravação]│
└─────────────────────────┘
```

---

## PWA - Instalação

### Desktop (Chrome/Edge)
1. Clique no ícone de instalação na barra de endereço
2. Ou: Menu → Instalar Whisper Dictation
3. App abre em janela standalone

### Mobile (Chrome Android)
1. Menu → Adicionar à tela inicial
2. Ícone aparece no launcher
3. App abre fullscreen

### Recursos PWA
- **Interface em cache**: UI carrega offline, mas transcrição requer internet
- **Ícones**: Aparecem no sistema operacional
- **Shortcuts**: Menu de contexto com atalhos
- **File handling**: Abre arquivos .wav, .mp3, etc
- **Share target**: Recebe arquivos compartilhados

**⚠️ Importante**: A transcrição requer conexão com internet (API Whisper online)

---

## Troubleshooting

### Microfone não funciona
- Verifique permissões do navegador
- Use HTTPS (localhost ok para testes)
- Teste em outro navegador

### API não responde
- Verifique chave da API no arquivo `.env`
- Certifique-se de que o servidor Node.js está rodando (`npm start`)
- Teste a chave no OpenAI Playground
- Verifique saldo da conta OpenAI
- Veja console do servidor e do navegador (F12) para erros detalhados

### Animações travadas
- Verifique GPU acceleration
- Desabilite prefers-reduced-motion se ativado
- Use navegador moderno (Chrome 90+)

### PWA não instala
- Use HTTPS (obrigatório para PWA)
- Verifique manifest.json (sem erros)
- Service Worker deve estar registrado
- Ícones devem estar presentes

---

## Performance

### 60 FPS Garantido
- GPU acceleration em animações
- requestAnimationFrame para waveform
- CSS transforms (não left/top)
- will-change nas animações

### Otimizações
- Passive event listeners
- Debounced updates
- Lazy audio context
- Efficient DOM manipulation

---

## Customização Rápida

### Mudar Cores
Edite `:root` em `styles.css`:
```css
:root {
    --color-primary-start: #667eea; /* Sua cor */
    --color-primary-end: #764ba2;   /* Sua cor */
}
```

### Mudar Duração do Ring
Em `app.js`, função `updateRingProgress()`:
```javascript
const maxSeconds = 60; // Mude para 120, 180, etc
```

### Adicionar Sons
Em `app.js`, nas funções:
```javascript
function startRecording() {
    // Adicione:
    new Audio('start.mp3').play();
}
```

---

## Créditos

- **Waveform**: Web Audio API + Canvas
- **Animações**: CSS3 + JavaScript
- **Transcrição**: OpenAI Whisper API
- **Design**: Custom dark theme premium
- **Acessibilidade**: WCAG AAA guidelines

---

## Suporte

### Navegadores Testados
- ✅ Chrome 90+
- ✅ Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Opera 76+

### Dispositivos
- ✅ Desktop (Windows, Mac, Linux)
- ✅ Mobile (Android, iOS)
- ✅ Tablet

---

**Versão**: 1.0.0 Premium
**Última atualização**: 2025-11-14
**Status**: Produção ✅
