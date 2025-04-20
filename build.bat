@echo off
echo Cleaning build artifacts...
if exist .next rmdir /s /q .next
if exist out rmdir /s /q out

echo Building project with type checking disabled...
npx next build --no-lint

echo Done! 