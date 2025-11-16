@echo off
REM ========================================
REM Whisper Dictation - Iniciar Aplicativo
REM ========================================

echo.
echo ╔════════════════════════════════════════╗
echo ║  🎙️  Whisper Dictation Premium        ║
echo ╚════════════════════════════════════════╝
echo.

REM Ir para o diretório do projeto
cd /d "%~dp0"

REM Verificar se o Node.js está instalado
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ Node.js não está instalado!
    echo.
    echo Baixe em: https://nodejs.org
    pause
    exit /b 1
)

REM Verificar se as dependências estão instaladas
if not exist "node_modules" (
    echo 📦 Instalando dependências...
    call npm install
    echo.
)

REM Verificar se o .env existe
if not exist ".env" (
    echo ❌ Arquivo .env não encontrado!
    echo.
    echo Crie um arquivo .env com sua chave da API:
    echo OPENAI_API_KEY=sk-proj-sua-chave-aqui
    echo PORT=3000
    echo.
    pause
    exit /b 1
)

REM Iniciar servidor
echo ⚡ Iniciando servidor...
echo.
start "Whisper Dictation Server" /MIN cmd /c "node server.js"

REM Aguardar servidor iniciar
timeout /t 2 /nobreak >nul

REM Abrir navegador
echo 🌐 Abrindo aplicativo no navegador...
start http://localhost:3000

echo.
echo ✅ Aplicativo iniciado com sucesso!
echo.
echo 💡 Para fechar o aplicativo:
echo    - Feche a janela minimizada "Whisper Dictation Server"
echo    - Ou execute: taskkill /FI "WINDOWTITLE eq Whisper Dictation Server*"
echo.
echo Pressione qualquer tecla para sair deste script...
pause >nul
