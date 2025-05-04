@echo off
echo Fixing Next.js build error...

REM Close any processes that might be holding onto .next/trace
taskkill /F /IM node.exe 2>NUL

REM Try to delete the .next directory
echo Removing .next directory...
rmdir /S /Q .next 2>NUL

REM Create a new .next/trace directory with proper permissions
echo Creating new .next directory structure...
mkdir .next
mkdir .next\trace
attrib +a .next\trace

echo Done! Now try running 'npm run build' again. 