import re
import nltk
from typing import List, Dict, Any
from models.schemas import ChunkInfo, ChunkingStrategy, StrategyInfo
from langchain.text_splitter import (
    RecursiveCharacterTextSplitter,
    CharacterTextSplitter
)
from sentence_transformers import SentenceTransformer
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import logging

logger = logging.getLogger(__name__)

class ChunkingService:
    def __init__(self):
        self.sentence_model = None
        self._initialize_nltk()
        
    def _initialize_nltk(self):
        """Initialize NLTK data"""
        try:
            nltk.data.find('tokenizers/punkt')
        except LookupError:
            nltk.download('punkt')
    
    def _get_sentence_model(self):
        """Lazy load sentence transformer model"""
        if self.sentence_model is None:
            try:
                self.sentence_model = SentenceTransformer('all-MiniLM-L6-v2')
            except Exception as e:
                logger.warning(f"Could not load sentence transformer: {e}")
                self.sentence_model = None
        return self.sentence_model
    
    def chunk_text(self, text: str, strategy: ChunkingStrategy, chunk_size: int = 1000, chunk_overlap: int = 200) -> List[ChunkInfo]:
        """Apply chunking strategy to text"""
        if strategy == ChunkingStrategy.FIXED:
            return self._fixed_chunking(text, chunk_size, chunk_overlap)
        elif strategy == ChunkingStrategy.RECURSIVE:
            return self._recursive_chunking(text, chunk_size, chunk_overlap)
        elif strategy == ChunkingStrategy.DOCUMENT:
            return self._document_chunking(text, chunk_size, chunk_overlap)
        elif strategy == ChunkingStrategy.SEMANTIC:
            return self._semantic_chunking(text, chunk_size, chunk_overlap)
        else:
            raise ValueError(f"Unknown chunking strategy: {strategy}")
    
    def _fixed_chunking(self, text: str, chunk_size: int, chunk_overlap: int) -> List[ChunkInfo]:
        """Fixed-size chunking with overlap"""
        chunks = []
        start = 0
        chunk_id = 0
        
        while start < len(text):
            end = min(start + chunk_size, len(text))
            chunk_content = text[start:end]
            
            # Calculate overlap with previous chunk
            overlap = min(chunk_overlap, start) if chunk_id > 0 else 0
            
            chunks.append(ChunkInfo(
                id=chunk_id,
                content=chunk_content,
                start_index=start,
                end_index=end,
                size=len(chunk_content),
                overlap_with_previous=overlap,
                metadata={"method": "fixed", "target_size": chunk_size}
            ))
            
            start = end - chunk_overlap
            chunk_id += 1
            
            if start >= len(text):
                break
        
        return chunks
    
    def _recursive_chunking(self, text: str, chunk_size: int, chunk_overlap: int) -> List[ChunkInfo]:
        """Recursive character text splitting"""
        try:
            splitter = RecursiveCharacterTextSplitter(
                chunk_size=chunk_size,
                chunk_overlap=chunk_overlap,
                length_function=len,
                separators=["\n\n", "\n", " ", ""]
            )
            
            splits = splitter.split_text(text)
            chunks = []
            current_pos = 0
            
            for i, split in enumerate(splits):
                # Find the position of this chunk in the original text
                start_pos = text.find(split, current_pos)
                if start_pos == -1:
                    start_pos = current_pos
                
                end_pos = start_pos + len(split)
                
                # Calculate overlap
                overlap = max(0, current_pos - start_pos) if i > 0 else 0
                
                chunks.append(ChunkInfo(
                    id=i,
                    content=split,
                    start_index=start_pos,
                    end_index=end_pos,
                    size=len(split),
                    overlap_with_previous=overlap,
                    metadata={"method": "recursive", "separators_used": True}
                ))
                
                current_pos = end_pos - chunk_overlap
            
            return chunks
        except Exception as e:
            logger.error(f"Recursive chunking failed: {e}")
            # Fallback to fixed chunking
            return self._fixed_chunking(text, chunk_size, chunk_overlap)
    
    def _document_chunking(self, text: str, chunk_size: int, chunk_overlap: int) -> List[ChunkInfo]:
        """Document-aware chunking (paragraph and sentence boundaries)"""
        try:
            # Split by paragraphs first
            paragraphs = re.split(r'\n\s*\n', text)
            chunks = []
            chunk_id = 0
            current_pos = 0
            
            current_chunk = ""
            chunk_start = 0
            
            for paragraph in paragraphs:
                paragraph = paragraph.strip()
                if not paragraph:
                    continue
                
                # Find position in original text
                para_start = text.find(paragraph, current_pos)
                if para_start == -1:
                    para_start = current_pos
                
                # If adding this paragraph would exceed chunk size, finalize current chunk
                if current_chunk and len(current_chunk) + len(paragraph) + 2 > chunk_size:
                    chunks.append(ChunkInfo(
                        id=chunk_id,
                        content=current_chunk.strip(),
                        start_index=chunk_start,
                        end_index=chunk_start + len(current_chunk),
                        size=len(current_chunk),
                        overlap_with_previous=0,
                        metadata={"method": "document", "type": "paragraph_boundary"}
                    ))
                    chunk_id += 1
                    current_chunk = ""
                    chunk_start = para_start
                
                if not current_chunk:
                    chunk_start = para_start
                
                current_chunk += paragraph + "\n\n"
                current_pos = para_start + len(paragraph)
            
            # Add final chunk
            if current_chunk.strip():
                chunks.append(ChunkInfo(
                    id=chunk_id,
                    content=current_chunk.strip(),
                    start_index=chunk_start,
                    end_index=chunk_start + len(current_chunk),
                    size=len(current_chunk),
                    overlap_with_previous=0,
                    metadata={"method": "document", "type": "paragraph_boundary"}
                ))
            
            return chunks
            
        except Exception as e:
            logger.error(f"Document chunking failed: {e}")
            return self._fixed_chunking(text, chunk_size, chunk_overlap)
    
    def _semantic_chunking(self, text: str, chunk_size: int, chunk_overlap: int) -> List[ChunkInfo]:
        """Semantic chunking using sentence embeddings"""
        try:
            model = self._get_sentence_model()
            if model is None:
                logger.warning("Sentence transformer not available, falling back to document chunking")
                return self._document_chunking(text, chunk_size, chunk_overlap)
            
            # Split into sentences
            sentences = nltk.sent_tokenize(text)
            if len(sentences) < 2:
                return self._fixed_chunking(text, chunk_size, chunk_overlap)
            
            # Get embeddings
            embeddings = model.encode(sentences)
            
            # Calculate semantic similarity between adjacent sentences
            similarities = []
            for i in range(len(sentences) - 1):
                sim = cosine_similarity([embeddings[i]], [embeddings[i + 1]])[0][0]
                similarities.append(sim)
            
            # Find split points where similarity drops significantly
            threshold = np.percentile(similarities, 30)  # Bottom 30% similarity
            split_points = [0]
            
            for i, sim in enumerate(similarities):
                if sim < threshold:
                    split_points.append(i + 1)
            
            split_points.append(len(sentences))
            
            # Create chunks
            chunks = []
            current_pos = 0
            
            for i in range(len(split_points) - 1):
                start_sent = split_points[i]
                end_sent = split_points[i + 1]
                
                chunk_sentences = sentences[start_sent:end_sent]
                chunk_content = " ".join(chunk_sentences)
                
                # Find position in original text
                start_pos = text.find(chunk_sentences[0], current_pos)
                if start_pos == -1:
                    start_pos = current_pos
                
                end_pos = start_pos + len(chunk_content)
                
                # If chunk is too large, split it further
                if len(chunk_content) > chunk_size * 1.5:
                    sub_chunks = self._fixed_chunking(chunk_content, chunk_size, chunk_overlap)
                    for j, sub_chunk in enumerate(sub_chunks):
                        chunks.append(ChunkInfo(
                            id=len(chunks),
                            content=sub_chunk.content,
                            start_index=start_pos + sub_chunk.start_index,
                            end_index=start_pos + sub_chunk.end_index,
                            size=sub_chunk.size,
                            overlap_with_previous=sub_chunk.overlap_with_previous if j > 0 else 0,
                            metadata={"method": "semantic", "split_reason": "size_overflow", "similarity_threshold": threshold}
                        ))
                else:
                    chunks.append(ChunkInfo(
                        id=len(chunks),
                        content=chunk_content,
                        start_index=start_pos,
                        end_index=end_pos,
                        size=len(chunk_content),
                        overlap_with_previous=0,
                        metadata={"method": "semantic", "sentences_count": len(chunk_sentences), "similarity_threshold": threshold}
                    ))
                
                current_pos = end_pos
            
            return chunks
            
        except Exception as e:
            logger.error(f"Semantic chunking failed: {e}")
            return self._document_chunking(text, chunk_size, chunk_overlap)
    
    def get_strategy_explanation(self, strategy: ChunkingStrategy) -> str:
        """Get explanation for a chunking strategy"""
        explanations = {
            ChunkingStrategy.FIXED: "Fixed chunking splits text into equal-sized chunks with specified overlap. Simple and predictable, but may break sentences or paragraphs.",
            ChunkingStrategy.RECURSIVE: "Recursive chunking tries to split text at natural boundaries (paragraphs, sentences, words) while respecting size limits. More context-aware than fixed chunking.",
            ChunkingStrategy.DOCUMENT: "Document-aware chunking respects document structure like paragraphs and sections. Preserves semantic coherence but may create variable-sized chunks.",
            ChunkingStrategy.SEMANTIC: "Semantic chunking uses AI embeddings to group semantically similar sentences together. Creates the most coherent chunks but is computationally intensive."
        }
        return explanations.get(strategy, "Unknown strategy")
    
    def get_available_strategies(self) -> Dict[str, StrategyInfo]:
        """Get information about all available chunking strategies"""
        return {
            "fixed": StrategyInfo(
                name="Fixed Size Chunking",
                description="Splits text into equal-sized chunks with specified overlap",
                advantages=["Simple and predictable", "Consistent chunk sizes", "Fast processing"],
                disadvantages=["May break sentences/paragraphs", "Ignores document structure", "Can split important context"],
                use_cases=["Large documents", "When consistent chunk sizes are important", "Simple RAG systems"]
            ),
            "recursive": StrategyInfo(
                name="Recursive Character Splitting",
                description="Intelligently splits text at natural boundaries while respecting size limits",
                advantages=["Respects natural boundaries", "Good balance of size and context", "Handles various text types"],
                disadvantages=["More complex than fixed", "Variable chunk sizes", "May still break context"],
                use_cases=["General-purpose text processing", "Mixed content types", "When structure matters"]
            ),
            "document": StrategyInfo(
                name="Document-Aware Chunking",
                description="Preserves document structure like paragraphs and sections",
                advantages=["Preserves semantic coherence", "Respects document structure", "Natural reading flow"],
                disadvantages=["Highly variable chunk sizes", "May create very large chunks", "Document-dependent"],
                use_cases=["Structured documents", "Academic papers", "When document structure is important"]
            ),
            "semantic": StrategyInfo(
                name="Semantic Chunking",
                description="Groups semantically similar content using AI embeddings",
                advantages=["Highest semantic coherence", "Context-aware splitting", "Intelligent grouping"],
                disadvantages=["Computationally intensive", "Requires AI models", "Variable processing time"],
                use_cases=["High-quality RAG systems", "When semantic coherence is critical", "Research applications"]
            )
        } 