@echo off
chcp 65001 >nul
echo 🚀 Đang khởi động Máy Chủ Web Học Viện Tiếng Trung Toàn Diện (HSK Cosmic Academy)...
where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    start "HSK Cosmic Academy Server" cmd /k "cd /d "%~dp0" && node server/server.js"
    timeout /t 1 /nobreak >nul
    start "" "http://localhost:8088"
) else (
    echo ⚠️ Không tìm thấy Node.js trong PATH — mở chế độ Offline trực tiếp...
    start "" "%~dp0index.html"
)
