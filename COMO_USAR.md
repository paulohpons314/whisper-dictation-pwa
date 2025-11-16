# 🎙️ Como Usar o Whisper Dictation

## Primeira Vez (Configuração)

### 1. Instalar Node.js
- Baixe em: https://nodejs.org
- Instale a versão LTS (recomendada)
- Reinicie o computador após instalação

### 2. Configurar Chave da API
1. Copie o arquivo `.env.example` para `.env`
2. Abra `.env` e adicione sua chave OpenAI:
   ```
   OPENAI_API_KEY=sk-proj-sua-chave-aqui
   PORT=3000
   ```

### 3. Instalar Dependências
Execute uma vez:
```bash
npm install
```

---

## Usar o Aplicativo

### Método 1: Clique Duplo (Mais Fácil) ⭐
1. **Abrir**: Clique duplo em `start-app.bat`
2. O servidor inicia automaticamente e abre o navegador
3. **Fechar**: Clique duplo em `stop-app.bat`

### Método 2: Terminal
1. Abra o terminal nesta pasta
2. Execute: `npm start`
3. Acesse: http://localhost:3000
4. Para parar: Pressione `Ctrl+C` no terminal

---

## Instalar como Aplicativo (Opcional)

Após iniciar o servidor:

### Windows (Chrome/Edge)
1. Acesse `http://localhost:3000`
2. Clique no ícone de **instalação** (🔽) na barra de endereço
3. Clique em "Instalar"
4. Um ícone aparecerá na área de trabalho

### Vantagens do PWA Instalado
- ✅ Ícone na área de trabalho
- ✅ Abre em janela própria (sem barra de endereço)
- ✅ Aparece na lista de aplicativos do Windows
- ✅ Interface carregada do cache (mais rápido)

**⚠️ Importante**: 
- O servidor precisa estar rodando em background
- Conexão com internet é necessária para transcrição (API Whisper)

---

## Iniciar Automaticamente com o Windows

### Opção A: Atalho na Inicialização
1. Pressione `Win+R` e digite: `shell:startup`
2. Crie um atalho de `start-app.bat` nesta pasta
3. O app iniciará automaticamente ao ligar o PC

### Opção B: Tarefa Agendada (Mais Avançado)
1. Abra "Agendador de Tarefas" do Windows
2. Criar Tarefa Básica
3. Disparador: "Ao fazer logon"
4. Ação: Iniciar programa → `start-app.bat`
5. Marcar "Executar minimizado"

---

## Criar Atalho na Área de Trabalho

1. Clique com botão direito em `start-app.bat`
2. "Criar atalho"
3. Arraste o atalho para a área de trabalho
4. Renomeie para "Whisper Dictation"

**Personalizar ícone**:
1. Clique direito no atalho → Propriedades
2. "Alterar ícone"
3. Escolha um ícone (ou baixe um .ico da internet)

---

## Solução de Problemas

### Servidor não inicia
- Verifique se o Node.js está instalado: `node --version`
- Verifique se a porta 3000 está livre
- Execute `npm install` novamente

### API não responde
- Verifique se `.env` existe e tem a chave correta
- Teste a chave em: https://platform.openai.com/playground
- Verifique saldo da conta OpenAI

### PWA não instala
- Use Chrome ou Edge (navegadores baseados em Chromium)
- Certifique-se de que está acessando `localhost:3000`
- Limpe cache do navegador (Ctrl+Shift+Del)

---

## Desinstalar

### Remover PWA
- Windows: Configurações → Aplicativos → Whisper Dictation → Desinstalar
- Chrome: chrome://apps → Clique direito → Remover

### Remover Arquivos
- Delete a pasta do projeto

---

## Recursos

- **Atalhos de Teclado**:
  - `Ctrl+Shift+R` - Iniciar/Finalizar gravação
  - `Ctrl+Shift+P` - Pausar/Retomar
  - `Escape` - Voltar ao início

- **Formatos Suportados**:
  - Gravação: WebM, WAV
  - Upload: MP3, WAV, M4A, WebM, FLAC, OGG

- **Limite**: 25MB por arquivo

---

**Versão**: 1.0.0
**Suporte**: Abra uma issue no GitHub
