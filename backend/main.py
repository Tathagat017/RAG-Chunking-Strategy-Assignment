from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from typing import List, Dict, Any
import os
from pathlib import Path

# Import our modules
from services.pdf_service import PDFService
from services.chunking_service import ChunkingService
from models.schemas import ChunkingRequest, ChunkingResponse

# Create FastAPI app
app = FastAPI(
    title="RAG Chunking Strategy API",
    description="API for visualizing different chunking strategies for RAG systems",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
pdf_service = PDFService()
chunking_service = ChunkingService()

# Create uploads directory
uploads_dir = Path("uploads")
uploads_dir.mkdir(exist_ok=True)

@app.get("/")
async def root():
    return {"message": "RAG Chunking Strategy API"}

@app.post("/upload-pdf")
async def upload_pdf(file: UploadFile = File(...)):
    """Upload a PDF file and extract text"""
    try:
        if not file.filename.endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files are allowed")
        
        # Save uploaded file
        file_path = uploads_dir / file.filename
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Extract text
        extracted_text = pdf_service.extract_text(str(file_path))
        
        # Clean up file
        os.remove(file_path)
        
        return {
            "filename": file.filename,
            "text": extracted_text,
            "text_length": len(extracted_text)
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chunk-text", response_model=ChunkingResponse)
async def chunk_text(request: ChunkingRequest):
    """Apply chunking strategy to text"""
    try:
        chunks = chunking_service.chunk_text(
            text=request.text,
            strategy=request.strategy,
            chunk_size=request.chunk_size,
            chunk_overlap=request.chunk_overlap
        )
        
        return ChunkingResponse(
            strategy=request.strategy,
            chunks=chunks,
            total_chunks=len(chunks),
            strategy_explanation=chunking_service.get_strategy_explanation(request.strategy)
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/chunking-strategies")
async def get_chunking_strategies():
    """Get available chunking strategies with explanations"""
    return chunking_service.get_available_strategies()

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 