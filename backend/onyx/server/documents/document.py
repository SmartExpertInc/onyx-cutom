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


@router.post("/get-file-content")
def get_file_content(
    request: FileContentRequest,
    user: User | None = Depends(current_user),
    db_session: Session = Depends(get_session),
) -> FileContentResponse:
    """
    Get document chunks for uploaded files by file_id.
    
    This endpoint:
    1. Maps file_ids to document_ids via UserFile table
    2. Retrieves chunks from Vespa using id_based_retrieval
    3. Returns chunks in natural order (limited by max_chunks_per_file)
    4. Respects user ACL permissions
    
    Note: Semantic ranking by query is planned for future enhancement.
    Current implementation returns chunks in their natural order from Vespa,
    which is still vastly superior to chat-based extraction (no LLM refusal).
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
    
    # Note: Semantic ranking by query removed for simplicity (Phase 1 implementation)
    # Chunks are returned in their natural order from Vespa
    # This is still much better than chat-based extraction which often refuses for large files
    # TODO: Add semantic ranking in future enhancement
    
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
                relevance_score=None  # Semantic ranking not implemented yet
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
