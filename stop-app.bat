@echo off
REM ========================================
REM Whisper Dictation - Parar Aplicativo
REM ========================================

echo.
echo ╔════════════════════════════════════════╗
echo ║  🛑 Parando Whisper Dictation...      ║
echo ╚════════════════════════════════════════╝
echo.

REM Matar processo do servidor
taskkill /FI "WINDOWTITLE eq Whisper Dictation Server*" /F >nul 2>&1

if %ERRORLEVEL% equ 0 (
    echo ✅ Servidor parado com sucesso!
) else (
    echo ⚠️  Nenhum servidor ativo encontrado.
)

echo.
pause
