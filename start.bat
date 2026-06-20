@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"
set PORT=8000

rem 偵測 python 還是 py
where python >nul 2>nul && (set PY=python) || (set PY=py)

echo ============================================
echo  本草藥房  本機伺服器
echo  網址： http://localhost:%PORT%/
echo  停止：關閉接著跳出的「伺服器」黑視窗即可
echo ============================================

rem 在新視窗啟動伺服器（關閉該視窗即停止）
start "herb_forager 伺服器（關閉此視窗即停止）" cmd /k %PY% -m http.server %PORT%

rem 稍候伺服器起來再開瀏覽器
timeout /t 2 /nobreak >nul
start "" http://localhost:%PORT%/

exit
