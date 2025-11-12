from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException
from fastapi import Query
from sqlalchemy.orm import Session

from onyx.auth.users import current_user
from onyx.context.search.models import IndexFilters
from onyx.context.search.preprocessing.access_filters import (
    build_access_filters_for_user,
)
from onyx.db.engine import get_session
from onyx.db.models import User
from onyx.db.search_settings import get_current_search_settings
from onyx.document_index.factory import get_default_document_index
from onyx.document_index.interfaces import VespaChunkRequest
from onyx.natural_language_processing.utils import get_tokenizer
from onyx.prompts.prompt_utils import build_doc_context_str
from onyx.server.documents.models import ChunkInfo
from onyx.server.documents.models import DocumentInfo
from onyx.server.documents.models import FileChunk
from onyx.server.documents.models import FileContentRequest
from onyx.server.documents.models import FileContentResponse
from onyx.db.models import UserFile
from onyx.natural_language_processing.search_nlp_models import get_default_embedding_model
from onyx.natural_language_processing.search_nlp_models import EmbeddingModel
from onyx.utils.threadpool_concurrency import run_functions_in_parallel
import numpy as np


router = APIRouter(prefix="/document")


# Have to use a query parameter as FastAPI is interpreting the URL type document_ids
# as a different path
@router.get("/document-size-info")
def get_document_info(
    document_id: str = Query(...),
    user: User | None = Depends(current_user),
    db_session: Session = Depends(get_session),
) -> DocumentInfo:
    search_settings = get_current_search_settings(db_session)
    document_index = get_default_document_index(search_settings, None)

    user_acl_filters = build_access_filters_for_user(user, db_session)
    inference_chunks = document_index.id_based_retrieval(
        chunk_requests=[VespaChunkRequest(document_id=document_id)],
        filters=IndexFilters(access_control_list=user_acl_filters),
    )

    if not inference_chunks:
        raise HTTPException(status_code=404, detail="Document not found")

    contents = [chunk.content for chunk in inference_chunks]

    combined_contents = "\n".join(contents)

    # get actual document context used for LLM
    first_chunk = inference_chunks[0]
    tokenizer_encode = get_tokenizer(
        provider_type=search_settings.provider_type,
        model_name=search_settings.model_name,
    ).encode
    full_context_str = build_doc_context_str(
        semantic_identifier=first_chunk.semantic_identifier,
        source_type=first_chunk.source_type,
        content=combined_contents,
        metadata_dict=first_chunk.metadata,
        updated_at=first_chunk.updated_at,
        ind=0,
    )

    return DocumentInfo(
        num_chunks=len(inference_chunks),
        num_tokens=len(tokenizer_encode(full_context_str)),
    )


@router.get("/chunk-info")
def get_chunk_info(
    document_id: str = Query(...),
    chunk_id: int = Query(...),
    user: User | None = Depends(current_user),
    db_session: Session = Depends(get_session),
) -> ChunkInfo:
    search_settings = get_current_search_settings(db_session)
    document_index = get_default_document_index(search_settings, None)

    user_acl_filters = build_access_filters_for_user(user, db_session)
    chunk_request = VespaChunkRequest(
        document_id=document_id,
        min_chunk_ind=chunk_id,
        max_chunk_ind=chunk_id,
    )

    inference_chunks = document_index.id_based_retrieval(
        chunk_requests=[chunk_request],
        filters=IndexFilters(access_control_list=user_acl_filters),
        batch_retrieval=True,
    )

    if not inference_chunks:
        raise HTTPException(status_code=404, detail="Chunk not found")

    chunk_content = inference_chunks[0].content

    tokenizer_encode = get_tokenizer(
        provider_type=search_settings.provider_type,
        model_name=search_settings.model_name,
    ).encode

    return ChunkInfo(
        content=chunk_content, num_tokens=len(tokenizer_encode(chunk_content))
    )


def _cosine_similarity(a: list[float], b: list[float]) -> float:
    """Calculate cosine similarity between two vectors"""
    a_np = np.array(a)
    b_np = np.array(b)
    return float(np.dot(a_np, b_np) / (np.linalg.norm(a_np) * np.linalg.norm(b_np)))


@router.post("/get-file-content")
def get_file_content(
    request: FileContentRequest,
    user: User | None = Depends(current_user),
    db_session: Session = Depends(get_session),
) -> FileContentResponse:
    """
    Get document chunks for uploaded files by file_id with optional semantic ranking.
    
    This endpoint:
    1. Maps file_ids to document_ids via UserFile table
    2. Retrieves chunks from Vespa using id_based_retrieval
    3. Optionally ranks chunks by semantic similarity to query
    4. Returns ordered chunks respecting max_chunks_per_file limit
    """
    user_id = user.id if user else None
    
    # Get user files from database
    user_files = (
        db_session.query(UserFile)
        .filter(
            UserFile.id.in_(request.file_ids),
            UserFile.user_id == user_id
        )
        .all()
    )
    
    if not user_files:
        raise HTTPException(
            status_code=404,
            detail=f"No files found for provided file_ids"
        )
    
    # Map file_id -> document_id
    file_id_to_doc_id = {
        user_file.id: user_file.document_id 
        for user_file in user_files
    }
    
    search_settings = get_current_search_settings(db_session)
    document_index = get_default_document_index(search_settings, None)
    user_acl_filters = build_access_filters_for_user(user, db_session)
    
    # Retrieve chunks for all documents
    chunk_requests = [
        VespaChunkRequest(document_id=doc_id)
        for doc_id in file_id_to_doc_id.values()
    ]
    
    all_chunks = document_index.id_based_retrieval(
        chunk_requests=chunk_requests,
        filters=IndexFilters(access_control_list=user_acl_filters),
    )
    
    if not all_chunks:
        return FileContentResponse(
            files={},
            total_chunks=0,
            total_tokens=0
        )
    
    # Group chunks by document_id, then map back to file_id
    doc_id_to_chunks = {}
    for chunk in all_chunks:
        if chunk.document_id not in doc_id_to_chunks:
            doc_id_to_chunks[chunk.document_id] = []
        doc_id_to_chunks[chunk.document_id].append(chunk)
    
    # Semantic ranking if query provided
    if request.query:
        try:
            embedding_model = get_default_embedding_model(
                db_session=db_session,
                search_settings=search_settings,
            )
            query_embedding = embedding_model.encode([request.query])[0]
            
            # Rank chunks within each document
            for doc_id, chunks in doc_id_to_chunks.items():
                # Get embeddings for chunks (use content)
                chunk_texts = [chunk.content for chunk in chunks]
                chunk_embeddings = embedding_model.encode(chunk_texts)
                
                # Calculate similarities
                similarities = [
                    _cosine_similarity(query_embedding.tolist(), emb.tolist())
                    for emb in chunk_embeddings
                ]
                
                # Sort chunks by similarity (descending)
                sorted_indices = sorted(
                    range(len(similarities)),
                    key=lambda i: similarities[i],
                    reverse=True
                )
                
                # Reorder chunks and attach scores
                ranked_chunks = []
                for idx in sorted_indices:
                    chunk = chunks[idx]
                    # Store similarity score for later use
                    chunk.score = similarities[idx]  # Use score field temporarily
                    ranked_chunks.append(chunk)
                
                doc_id_to_chunks[doc_id] = ranked_chunks
        except Exception as e:
            # If semantic ranking fails, continue without it
            logger.error(f"Failed to perform semantic ranking: {e}")
    
    # Build response: map document_id back to file_id
    result_files = {}
    total_chunks = 0
    
    for file_id, doc_id in file_id_to_doc_id.items():
        chunks = doc_id_to_chunks.get(doc_id, [])
        
        # Limit chunks per file
        chunks = chunks[:request.max_chunks_per_file]
        
        # Convert to FileChunk models
        file_chunks = [
            FileChunk(
                chunk_id=chunk.chunk_id,
                content=chunk.content,
                document_id=chunk.document_id,
                semantic_identifier=chunk.semantic_identifier,
                source_type=chunk.source_type.value,
                relevance_score=getattr(chunk, 'score', None)
            )
            for chunk in chunks
        ]
        
        result_files[file_id] = file_chunks
        total_chunks += len(file_chunks)
    
    return FileContentResponse(
        files=result_files,
        total_chunks=total_chunks,
        total_tokens=None  # Could calculate if needed
    )
