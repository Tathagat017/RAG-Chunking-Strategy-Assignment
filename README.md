# RAG Chunking Strategy Visualizer

A full-stack web application for visualizing different text chunking strategies used in RAG (Retrieval-Augmented Generation) systems. Upload PDF documents and compare how different chunking strategies split the text.

## Features

- **PDF Upload & Text Extraction**: Upload PDF files and extract text content
- **Multiple Chunking Strategies**:
  - Fixed Size Chunking
  - Recursive Character Splitting
  - Document-Aware Chunking
  - Semantic Chunking (using AI embeddings)
- **Interactive Visualization**: See how text is split with color-coded highlighting
- **Strategy Comparison**: Compare advantages, disadvantages, and use cases
- **Chunk Metadata**: View detailed information about each chunk

## Tech Stack

### Backend

- **FastAPI**: Modern Python web framework
- **PyPDF2 & pdfplumber**: PDF text extraction
- **LangChain**: Text splitting utilities
- **Sentence Transformers**: Semantic chunking with AI embeddings
- **NLTK**: Natural language processing

### Frontend

- **React 18**: Modern React with hooks
- **TypeScript**: Type safety
- **Vite**: Fast build tool
- **Mantine UI**: Beautiful component library
- **Axios**: HTTP client

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Run the setup script:

   **On Windows:**

   ```bash
   setup.bat
   ```

   **On macOS/Linux:**

   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```

3. Activate the virtual environment:

   **On Windows:**

   ```bash
   venv\Scripts\activate
   ```

   **On macOS/Linux:**

   ```bash
   source venv/bin/activate
   ```

4. Start the server:

   ```bash
   python run.py
   ```

   The backend will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:5173`

## Usage

1. **Upload PDF**: Drag and drop a PDF file or click to select
2. **Extract Text**: Click "Extract Text from PDF" to process the document
3. **Configure Chunking**:
   - Select a chunking strategy
   - Adjust chunk size and overlap parameters
   - View strategy details and explanations
4. **Generate Chunks**: Click "Generate Chunks" to apply the selected strategy
5. **Visualize Results**:
   - **Visual Highlighting**: See chunks highlighted in the original text
   - **Chunk Details**: View individual chunks with metadata
   - **Metadata**: Inspect technical details of each chunk

## Chunking Strategies

### Fixed Size Chunking

- Splits text into equal-sized chunks with specified overlap
- **Pros**: Simple, predictable, consistent sizes
- **Cons**: May break sentences/paragraphs, ignores structure
- **Use Cases**: Large documents, simple RAG systems

### Recursive Character Splitting

- Intelligently splits at natural boundaries (paragraphs, sentences, words)
- **Pros**: Respects boundaries, balanced size/context, handles various text types
- **Cons**: More complex, variable chunk sizes
- **Use Cases**: General-purpose processing, mixed content

### Document-Aware Chunking

- Preserves document structure like paragraphs and sections
- **Pros**: Semantic coherence, respects structure, natural flow
- **Cons**: Highly variable sizes, may create large chunks
- **Use Cases**: Structured documents, academic papers

### Semantic Chunking

- Groups semantically similar content using AI embeddings
- **Pros**: Highest semantic coherence, context-aware, intelligent grouping
- **Cons**: Computationally intensive, requires AI models
- **Use Cases**: High-quality RAG, research applications

## API Endpoints

- `POST /upload-pdf`: Upload and extract text from PDF
- `POST /chunk-text`: Apply chunking strategy to text
- `GET /chunking-strategies`: Get available strategies with descriptions
- `GET /`: Health check

## Development

### Backend Development

```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Development

```bash
cd frontend
npm run dev
```

## Project Structure

```
├── backend/
│   ├── main.py              # FastAPI application
│   ├── models/
│   │   └── schemas.py       # Pydantic models
│   ├── services/
│   │   ├── pdf_service.py   # PDF processing
│   │   └── chunking_service.py  # Chunking strategies
│   ├── requirements.txt     # Python dependencies
│   ├── setup.sh            # Linux/macOS setup
│   ├── setup.bat           # Windows setup
│   └── run.py              # Server runner
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── App.tsx         # Main app component
│   │   ├── api.ts          # API client
│   │   └── types.ts        # TypeScript types
│   ├── package.json        # Node dependencies
│   └── vite.config.ts      # Vite configuration
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
