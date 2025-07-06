@echo off

echo Setting up RAG Chunking Backend...

REM Create virtual environment
echo Creating virtual environment...
python -m venv venv

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo Installing dependencies...
pip install --upgrade pip
pip install -r requirements.txt

REM Download NLTK data
echo Downloading NLTK data...
python -c "import nltk; nltk.download('punkt')"

echo Backend setup complete!
echo To run the server:
echo 1. Activate the virtual environment:
echo    venv\Scripts\activate.bat
echo 2. Start the server:
echo    python run.py
echo    OR
echo    uvicorn main:app --reload

pause 