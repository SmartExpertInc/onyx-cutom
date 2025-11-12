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
from onyx.utils.logger import setup_logger
from onyx.natural_language_processing.search_nlp_models import EmbeddingModel
from onyx.db.embedding_model import get_current_db_embedding_model
from onyx.configs.model_configs import EMBEDDING_MODEL_SERVER_HOST
from onyx.configs.model_configs import MODEL_SERVER_PORT
import numpy as np


logger = setup_logger()
router = APIRouter(prefix="/document")


def _compute_cosine_similarity(vec1: list[float], vec2: list[float]) -> float:
    """Compute cosine similarity between two vectors."""
    a = np.array(vec1)
    b = np.array(vec2)
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))


def _rank_chunks_by_query(
    chunks: list,
    query: str | None,
    embedding_model: EmbeddingModel | None,
    db_session: Session,
) -> list:
    """Rank chunks by semantic similarity to query."""
    if not query or not embedding_model or not chunks:
        logger.info(f"[SEMANTIC_RANK] Skipping ranking: query={bool(query)}, model={bool(embedding_model)}, chunks={len(chunks) if chunks else 0}")
        return chunks
    
    try:
        logger.info(f"[SEMANTIC_RANK] Ranking {len(chunks)} chunks by query: {query[:100]}...")
        
        # Get query embedding
        from onyx.natural_language_processing.search_nlp_models import EmbedRequest, EmbedTextType
        query_embed_req = EmbedRequest(
            texts=[query],
            model_name=embedding_model.model_name,
            max_context_length=embedding_model.tokenizer.max_seq_length,
            normalize_embeddings=embedding_model.normalize,
            api_key=embedding_model.api_key,
            provider_type=embedding_model.provider_type,
            prefix=embedding_model.query_prefix,
            text_type=EmbedTextType.QUERY,
            manual_query_reduction_disabled=False,
        )
        
        query_response = embedding_model._make_model_server_request(query_embed_req)
        query_embedding = query_response.embeddings[0]
        
        logger.info(f"[SEMANTIC_RANK] Query embedding computed: dim={len(query_embedding)}")
        
        # Get embeddings for all chunk contents
        chunk_texts = [chunk.content for chunk in chunks]
        chunks_embed_req = EmbedRequest(
            texts=chunk_texts,
            model_name=embedding_model.model_name,
            max_context_length=embedding_model.tokenizer.max_seq_length,
            normalize_embeddings=embedding_model.normalize,
            api_key=embedding_model.api_key,
            provider_type=embedding_model.provider_type,
            prefix=embedding_model.passage_prefix,
            text_type=EmbedTextType.PASSAGE,
            manual_query_reduction_disabled=False,
        )
        
        chunks_response = embedding_model._make_model_server_request(chunks_embed_req)
        chunk_embeddings = chunks_response.embeddings
        
        logger.info(f"[SEMANTIC_RANK] Chunk embeddings computed: count={len(chunk_embeddings)}")
        
        # Compute similarity scores
        scored_chunks = []
        for i, chunk in enumerate(chunks):
            similarity = _compute_cosine_similarity(query_embedding, chunk_embeddings[i])
            scored_chunks.append((similarity, chunk))
        
        # Sort by similarity (descending)
        scored_chunks.sort(key=lambda x: x[0], reverse=True)
        
        logger.info(f"[SEMANTIC_RANK] Top 5 scores: {[f'{score:.3f}' for score, _ in scored_chunks[:5]]}")
        
        # Return chunks in ranked order
        return [chunk for _, chunk in scored_chunks]
        
    except Exception as e:
        logger.error(f"[SEMANTIC_RANK] Error ranking chunks: {e}", exc_info=True)
        # Fall back to original order if ranking fails
        return chunks


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
    3. If query provided: ranks chunks by semantic similarity to query
    4. Returns top chunks (limited by max_chunks_per_file)
    5. Respects user ACL permissions
    
    Semantic Ranking:
    - When query is provided, computes embeddings for query and all chunks
    - Ranks chunks by cosine similarity to query
    - Returns most relevant chunks first
    - Falls back to natural order if ranking fails
    
    This direct vector access eliminates LLM refusal issues for large files
    and provides semantically relevant content for product generation.
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
    # IMPORTANT: UserFile.document_id uses "USER_FILE_CONNECTOR__" prefix,
    # but the actual indexed document in Vespa uses "FILE_CONNECTOR__" prefix
    file_id_to_doc_id = {}
    for user_file in user_files:
        # Transform USER_FILE_CONNECTOR__ -> FILE_CONNECTOR__
        actual_doc_id = user_file.document_id.replace("USER_FILE_CONNECTOR__", "FILE_CONNECTOR__", 1)
        file_id_to_doc_id[user_file.id] = actual_doc_id
    
    # DEBUG: Log the mapping
    logger.info(f"[GET_FILE_CONTENT] Mapped {len(file_id_to_doc_id)} files:")
    for file_id, doc_id in file_id_to_doc_id.items():
        logger.info(f"[GET_FILE_CONTENT]   file_id={file_id} -> document_id={doc_id}")
    
    search_settings = get_current_search_settings(db_session)
    document_index = get_default_document_index(search_settings, None)
    user_acl_filters = build_access_filters_for_user(user, db_session)
    
    logger.info(f"[GET_FILE_CONTENT] ACL filters: {user_acl_filters}")
    
    # Retrieve chunks for all documents
    chunk_requests = [
        VespaChunkRequest(document_id=doc_id)
        for doc_id in file_id_to_doc_id.values()
    ]
    
    logger.info(f"[GET_FILE_CONTENT] Requesting chunks for {len(chunk_requests)} documents")
    
    all_chunks = document_index.id_based_retrieval(
        chunk_requests=chunk_requests,
        filters=IndexFilters(access_control_list=user_acl_filters),
    )
    
    logger.info(f"[GET_FILE_CONTENT] Retrieved {len(all_chunks) if all_chunks else 0} chunks from Vespa")
    
    if not all_chunks:
        # Try again WITHOUT ACL filters to see if permissions are the issue
        logger.warning(f"[GET_FILE_CONTENT] No chunks found with ACL filters, retrying without filters for debugging...")
        all_chunks_no_acl = document_index.id_based_retrieval(
            chunk_requests=chunk_requests,
            filters=None,  # No filters
        )
        logger.info(f"[GET_FILE_CONTENT] Without ACL filters: {len(all_chunks_no_acl) if all_chunks_no_acl else 0} chunks")
        
        if all_chunks_no_acl:
            logger.error(f"[GET_FILE_CONTENT] ⚠️ ACL PERMISSION ISSUE: Chunks exist but are filtered by ACL")
            logger.error(f"[GET_FILE_CONTENT] Sample chunk document_id: {all_chunks_no_acl[0].document_id}")
            logger.error(f"[GET_FILE_CONTENT] Sample chunk access: {all_chunks_no_acl[0].access}")
        else:
            logger.error(f"[GET_FILE_CONTENT] ⚠️ DOCUMENT NOT FOUND: No chunks in Vespa for these document_ids")
            logger.error(f"[GET_FILE_CONTENT] Searched for document_ids: {list(file_id_to_doc_id.values())}")
        
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
    
    # Get embedding model for semantic ranking
    embedding_model = None
    if request.query:
        try:
            db_embedding_model = get_current_db_embedding_model(db_session)
            if db_embedding_model:
                embedding_model = EmbeddingModel(
                    server_host=EMBEDDING_MODEL_SERVER_HOST,
                    server_port=MODEL_SERVER_PORT,
                    model_name=db_embedding_model.model_name,
                    normalize=db_embedding_model.normalize,
                    query_prefix=db_embedding_model.query_prefix,
                    passage_prefix=db_embedding_model.passage_prefix,
                    api_key=db_embedding_model.api_key,
                    api_url=db_embedding_model.api_url,
                    provider_type=db_embedding_model.provider_type,
                )
                logger.info(f"[GET_FILE_CONTENT] Embedding model loaded: {db_embedding_model.model_name}")
        except Exception as e:
            logger.warning(f"[GET_FILE_CONTENT] Could not load embedding model: {e}")
    
    # Build response: map document_id back to file_id
    result_files = {}
    total_chunks = 0
    
    for file_id, doc_id in file_id_to_doc_id.items():
        chunks = doc_id_to_chunks.get(doc_id, [])
        
        if not chunks:
            continue
        
        # Apply semantic ranking if query provided
        if request.query and embedding_model:
            logger.info(f"[GET_FILE_CONTENT] Ranking {len(chunks)} chunks for file_id={file_id}")
            chunks = _rank_chunks_by_query(chunks, request.query, embedding_model, db_session)
        
        # Limit chunks per file (after ranking)
        chunks = chunks[:request.max_chunks_per_file]
        
        # Convert to FileChunk models with relevance scores
        file_chunks = []
        for idx, chunk in enumerate(chunks):
            # If ranked, higher index = lower relevance
            relevance_score = (len(chunks) - idx) / len(chunks) if request.query else None
            
            file_chunks.append(FileChunk(
                chunk_id=chunk.chunk_id,
                content=chunk.content,
                document_id=chunk.document_id,
                semantic_identifier=chunk.semantic_identifier,
                source_type=chunk.source_type.value,
                relevance_score=relevance_score
            ))
        
        result_files[file_id] = file_chunks
        total_chunks += len(file_chunks)
    
    return FileContentResponse(
        files=result_files,
        total_chunks=total_chunks,
        total_tokens=None  # Could calculate if needed
    )
