# Enhanced Logging Integration Example
# This file shows how to add comprehensive logging to preview endpoints

from enhanced_logging import (
    log_preview_step,
    log_onyx_request,
    log_streaming_chunk,
    log_text_processing,
    PreviewGenerationError,
    RequestTracker,
    create_request_id
)
import time
import json

# Example: Enhanced Course Outline Preview Endpoint
def enhanced_course_outline_preview_example(payload, request):
    """
    Example of how to enhance the course outline preview endpoint with detailed logging
    """
    # Generate unique request ID for tracking
    request_id = create_request_id()
    start_time = time.time()
    
    # Log request start with comprehensive details
    log_preview_step(request_id, "preview_start", {
        "endpoint": "course-outline/preview",
        "prompt_length": len(payload.prompt),
        "prompt_preview": payload.prompt[:100] + "..." if len(payload.prompt) > 100 else payload.prompt,
        "modules": payload.modules,
        "lessons_per_module": payload.lessonsPerModule,
        "language": payload.language,
        "from_files": payload.fromFiles,
        "from_text": payload.fromText,
        "text_mode": payload.textMode,
        "user_text_length": len(payload.userText) if payload.userText else 0,
        "has_chat_session": bool(payload.chatSessionId)
    })
    
    try:
        # Authentication check
        cookies = {ONYX_SESSION_COOKIE_NAME: request.cookies.get(ONYX_SESSION_COOKIE_NAME)}
        
        if not cookies[ONYX_SESSION_COOKIE_NAME]:
            log_preview_step(request_id, "authentication_failed", {"error": "No session cookie found"})
            raise HTTPException(status_code=401, detail="Not authenticated")
        
        log_preview_step(request_id, "authentication_success", {"session_cookie_present": True})

        # Chat session setup
        if payload.chatSessionId:
            chat_id = payload.chatSessionId
            log_preview_step(request_id, "chat_session_reused", {"chat_id": chat_id})
        else:
            log_preview_step(request_id, "chat_session_creation_start")
            try:
                persona_id = await get_contentbuilder_persona_id(cookies)
                log_preview_step(request_id, "persona_id_retrieved", {"persona_id": persona_id})
                
                chat_id = await create_onyx_chat_session(persona_id, cookies)
                log_preview_step(request_id, "chat_session_created", {"chat_id": chat_id})
            except Exception as e:
                log_preview_step(request_id, "chat_session_creation_failed", error=e)
                raise PreviewGenerationError("chat_session_creation", f"Failed to create chat session: {str(e)}", e)

        # Payload preparation
        log_preview_step(request_id, "payload_preparation_start")
        
        wiz_payload = {
            "product": "Course Outline",
            "prompt": payload.prompt,
            "language": payload.language,
        }

        # File context processing
        if payload.fromFiles:
            wiz_payload["fromFiles"] = True
            if payload.folderIds:
                wiz_payload["folderIds"] = payload.folderIds
            if payload.fileIds:
                wiz_payload["fileIds"] = payload.fileIds
            log_preview_step(request_id, "file_context_added", {
                "folder_ids": payload.folderIds,
                "file_ids": payload.fileIds
            })

        # Text context processing with detailed logging
        if payload.fromText and payload.userText:
            wiz_payload["fromText"] = True
            wiz_payload["textMode"] = payload.textMode
            
            text_length = len(payload.userText)
            
            # Log text processing details
            log_text_processing(request_id, text_length, "text_analysis", {
                "text_mode": payload.textMode,
                "compression_threshold": TEXT_SIZE_THRESHOLD,
                "large_text_threshold": LARGE_TEXT_THRESHOLD,
                "needs_compression": text_length > TEXT_SIZE_THRESHOLD,
                "needs_virtual_file": text_length > LARGE_TEXT_THRESHOLD
            })
            
            if text_length > LARGE_TEXT_THRESHOLD:
                log_preview_step(request_id, "virtual_file_creation_start", {
                    "text_length": text_length,
                    "threshold": LARGE_TEXT_THRESHOLD
                })
                try:
                    virtual_file_id = await create_virtual_text_file(payload.userText, cookies)
                    wiz_payload["virtualFileId"] = virtual_file_id
                    wiz_payload["textCompressed"] = False
                    log_preview_step(request_id, "virtual_file_created", {
                        "virtual_file_id": virtual_file_id,
                        "text_length": text_length
                    })
                except Exception as e:
                    log_preview_step(request_id, "virtual_file_creation_failed", error=e)
                    # Fallback to chunking
                    chunks = chunk_text(payload.userText)
                    if len(chunks) == 1:
                        compressed_text = compress_text(payload.userText)
                        wiz_payload["userText"] = compressed_text
                        wiz_payload["textCompressed"] = True
                        log_preview_step(request_id, "fallback_compression", {
                            "original_length": text_length,
                            "compressed_length": len(compressed_text)
                        })
                    else:
                        first_chunk = chunks[0]
                        compressed_chunk = compress_text(first_chunk)
                        wiz_payload["userText"] = compressed_chunk
                        wiz_payload["textCompressed"] = True
                        wiz_payload["textChunked"] = True
                        wiz_payload["totalChunks"] = len(chunks)
                        log_preview_step(request_id, "fallback_chunking", {
                            "original_length": text_length,
                            "chunk_length": len(compressed_chunk),
                            "total_chunks": len(chunks)
                        })
            elif text_length > TEXT_SIZE_THRESHOLD:
                compressed_text = compress_text(payload.userText)
                wiz_payload["userText"] = compressed_text
                wiz_payload["textCompressed"] = True
                log_preview_step(request_id, "text_compression", {
                    "original_length": text_length,
                    "compressed_length": len(compressed_text)
                })
            else:
                wiz_payload["userText"] = payload.userText
                wiz_payload["textCompressed"] = False
                log_preview_step(request_id, "direct_text_usage", {"text_length": text_length})

        # Outline processing
        if payload.originalOutline:
            wiz_payload["originalOutline"] = payload.originalOutline
            log_preview_step(request_id, "original_outline_used", {
                "outline_length": len(payload.originalOutline)
            })
        else:
            wiz_payload.update({
                "modules": payload.modules,
                "lessonsPerModule": payload.lessonsPerModule,
            })
            log_preview_step(request_id, "new_outline_parameters", {
                "modules": payload.modules,
                "lessons_per_module": payload.lessonsPerModule
            })

        # Text decompression if needed
        if wiz_payload.get("textCompressed") and wiz_payload.get("userText"):
            try:
                decompressed_text = decompress_text(wiz_payload["userText"])
                wiz_payload["userText"] = decompressed_text
                wiz_payload["textCompressed"] = False
                log_preview_step(request_id, "text_decompression", {
                    "decompressed_length": len(decompressed_text)
                })
            except Exception as e:
                log_preview_step(request_id, "text_decompression_failed", error=e)

        wizard_message = "WIZARD_REQUEST\n" + json.dumps(wiz_payload)
        
        log_preview_step(request_id, "payload_preparation_complete", {
            "wizard_message_length": len(wizard_message),
            "wizard_payload_keys": list(wiz_payload.keys())
        })

        # Streaming setup
        log_preview_step(request_id, "streaming_setup_start")

        async def enhanced_streamer():
            assistant_reply: str = ""
            last_send = asyncio.get_event_loop().time()
            chunk_count = 0

            timeout_duration = 300.0 if wiz_payload.get("virtualFileId") else None
            log_preview_step(request_id, "streaming_config", {
                "timeout_duration": timeout_duration,
                "has_virtual_file": bool(wiz_payload.get("virtualFileId"))
            })

            async with httpx.AsyncClient(timeout=timeout_duration) as client:
                # Parse IDs
                folder_ids_list = []
                file_ids_list = []
                if payload.fromFiles and payload.folderIds:
                    folder_ids_list = [int(fid) for fid in payload.folderIds.split(',') if fid.strip().isdigit()]
                if payload.fromFiles and payload.fileIds:
                    file_ids_list = [int(fid) for fid in payload.fileIds.split(',') if fid.strip().isdigit()]
                
                if wiz_payload.get("virtualFileId"):
                    file_ids_list.append(wiz_payload["virtualFileId"])
                    log_preview_step(request_id, "virtual_file_added", {
                        "virtual_file_id": wiz_payload["virtualFileId"]
                    })
                
                send_payload = {
                    "chat_session_id": chat_id,
                    "message": wizard_message,
                    "parent_message_id": None,
                    "file_descriptors": [],
                    "user_file_ids": file_ids_list,
                    "user_folder_ids": folder_ids_list,
                    "prompt_id": None,
                    "search_doc_ids": None,
                    "retrieval_options": {"run_search": "always", "real_time": False},
                    "stream_response": True,
                }

                # Log Onyx API request
                log_onyx_request(request_id, "/chat/send-message", send_payload)

                async with client.stream("POST", f"{ONYX_API_SERVER_URL}/chat/send-message", json=send_payload, cookies=cookies) as resp:
                    log_preview_step(request_id, "onyx_stream_started", {
                        "response_status": resp.status_code,
                        "content_type": resp.headers.get("content-type")
                    })

                    async for raw_line in resp.aiter_lines():
                        if not raw_line:
                            continue
                        line = raw_line.strip()
                        if line.startswith("data:"):
                            line = line.split("data:", 1)[1].strip()
                        if line == "[DONE]":
                            log_preview_step(request_id, "onyx_stream_complete", {
                                "total_chunks": chunk_count,
                                "total_reply_length": len(assistant_reply)
                            })
                            break
                        try:
                            pkt = json.loads(line)
                            if "answer_piece" in pkt:
                                delta_text = pkt["answer_piece"].replace("\\n", "\n")
                                assistant_reply += delta_text
                                chunk_count += 1

                                # Log streaming chunks (but limit frequency to avoid spam)
                                if chunk_count % 10 == 0:  # Log every 10th chunk
                                    log_streaming_chunk(request_id, "delta", len(delta_text), delta_text[:50])

                                yield (json.dumps({"type": "delta", "text": delta_text}) + "\n").encode()
                        except Exception as e:
                            log_preview_step(request_id, "chunk_parsing_error", error=e)
                            continue

                        # Keep-alive
                        now = asyncio.get_event_loop().time()
                        if now - last_send > 8:
                            yield b" "
                            last_send = now

            # Cache the result
            if chat_id:
                OUTLINE_PREVIEW_CACHE[chat_id] = assistant_reply
                log_cache_operation(request_id, "store", chat_id, True, {
                    "cache_size": len(assistant_reply)
                })

            # Parse and return
            modules_preview = _parse_outline_markdown(assistant_reply)
            log_preview_step(request_id, "outline_parsing_complete", {
                "modules_count": len(modules_preview),
                "parsed_successfully": bool(modules_preview)
            })

            done_packet = {"type": "done", "modules": modules_preview, "raw": assistant_reply}
            yield (json.dumps(done_packet) + "\n").encode()

        # Log completion
        total_duration = time.time() - start_time
        log_preview_step(request_id, "preview_complete", {
            "total_duration": total_duration,
            "wizard_payload_size": len(json.dumps(wiz_payload)),
            "chat_id": chat_id
        })
        
        log_performance_metric(request_id, "preview_generation_duration", total_duration, "seconds")

        return StreamingResponse(enhanced_streamer(), media_type="application/json")

    except Exception as e:
        # Log error with full context
        total_duration = time.time() - start_time
        log_preview_step(request_id, "preview_generation_failed", {
            "total_duration": total_duration,
            "error_type": type(e).__name__,
            "error_message": str(e)
        }, error=e)
        
        # Re-raise with enhanced context
        if isinstance(e, HTTPException):
            raise e
        else:
            raise PreviewGenerationError("preview_generation", f"Unexpected error: {str(e)}", e)


# Example: Using RequestTracker Context Manager
def enhanced_lesson_preview_example(payload, request, pool):
    """
    Example of how to enhance the lesson preview endpoint with RequestTracker
    """
    with RequestTracker() as tracker:
        # Authentication check
        cookies = {ONYX_SESSION_COOKIE_NAME: request.cookies.get(ONYX_SESSION_COOKIE_NAME)}
        if not cookies[ONYX_SESSION_COOKIE_NAME]:
            tracker.add_step("authentication_failed", {"error": "No session cookie found"})
            raise HTTPException(status_code=401, detail="Not authenticated")
        
        tracker.add_step("authentication_success", {"session_cookie_present": True})

        # Chat session setup
        if payload.chatSessionId:
            chat_id = payload.chatSessionId
            tracker.add_step("chat_session_reused", {"chat_id": chat_id})
        else:
            tracker.add_step("chat_session_creation_start")
            try:
                persona_id = await get_contentbuilder_persona_id(cookies)
                tracker.add_step("persona_id_retrieved", {"persona_id": persona_id})
                
                chat_id = await create_onyx_chat_session(persona_id, cookies)
                tracker.add_step("chat_session_created", {"chat_id": chat_id})
            except Exception as e:
                tracker.add_step("chat_session_creation_failed", error=e)
                raise PreviewGenerationError("chat_session_creation", f"Failed to create chat session: {str(e)}", e)

        # Build wizard request
        wizard_dict = {
            "product": "Slides Deck",
            "action": "preview",
            "language": payload.language,
            "slidesCount": payload.slidesCount or 5,
        }

        # Add outline context if provided
        if payload.outlineProjectId is not None:
            wizard_dict["outlineProjectId"] = payload.outlineProjectId
            tracker.add_step("outline_context_added", {"outline_project_id": payload.outlineProjectId})
            
            # Fetch outline name
            try:
                onyx_user_id = await get_current_onyx_user_id(request)
                async with pool.acquire() as conn:
                    outline_row = await conn.fetchrow(
                        "SELECT project_name FROM projects WHERE id = $1 AND onyx_user_id = $2",
                        payload.outlineProjectId, onyx_user_id
                    )
                    if outline_row:
                        wizard_dict["outlineName"] = outline_row["project_name"]
                        tracker.add_step("outline_name_fetched", {"outline_name": outline_row["project_name"]})
            except Exception as e:
                tracker.add_step("outline_name_fetch_failed", error=e)

        # Add lesson details
        if payload.lessonTitle:
            wizard_dict["lessonTitle"] = payload.lessonTitle
        if payload.prompt:
            wizard_dict["prompt"] = payload.prompt

        # Add file context
        if payload.fromFiles:
            wizard_dict["fromFiles"] = True
            if payload.folderIds:
                wizard_dict["folderIds"] = payload.folderIds
            if payload.fileIds:
                wizard_dict["fileIds"] = payload.fileIds
            tracker.add_step("file_context_added", {
                "folder_ids": payload.folderIds,
                "file_ids": payload.fileIds
            })

        # Add text context
        if payload.fromText and payload.userText:
            wizard_dict["fromText"] = True
            wizard_dict["textMode"] = payload.textMode
            
            text_length = len(payload.userText)
            log_text_processing(tracker.request_id, text_length, "lesson_text_analysis", {
                "text_mode": payload.textMode,
                "compression_needed": text_length > TEXT_SIZE_THRESHOLD
            })
            
            if text_length > TEXT_SIZE_THRESHOLD:
                compressed_text = compress_text(payload.userText)
                wizard_dict["userText"] = compressed_text
                wizard_dict["textCompressed"] = True
                tracker.add_step("lesson_text_compressed", {
                    "original_length": text_length,
                    "compressed_length": len(compressed_text)
                })
            else:
                wizard_dict["userText"] = payload.userText
                wizard_dict["textCompressed"] = False
                tracker.add_step("lesson_text_direct", {"text_length": text_length})

        # Decompress if needed
        if wizard_dict.get("textCompressed") and wizard_dict.get("userText"):
            try:
                decompressed_text = decompress_text(wizard_dict["userText"])
                wizard_dict["userText"] = decompressed_text
                wizard_dict["textCompressed"] = False
                tracker.add_step("lesson_text_decompressed", {
                    "decompressed_length": len(decompressed_text)
                })
            except Exception as e:
                tracker.add_step("lesson_text_decompression_failed", error=e)

        wizard_message = "WIZARD_REQUEST\n" + json.dumps(wizard_dict)
        
        tracker.add_step("lesson_payload_built", {
            "wizard_message_length": len(wizard_message),
            "wizard_payload_keys": list(wizard_dict.keys())
        })

        # Streaming response
        tracker.add_step("lesson_streaming_started")

        async def enhanced_lesson_streamer():
            last_send = asyncio.get_event_loop().time()
            chunk_count = 0

            async with httpx.AsyncClient(timeout=None) as client:
                # Parse IDs
                folder_ids_list = []
                file_ids_list = []
                if payload.fromFiles and payload.folderIds:
                    folder_ids_list = [int(fid) for fid in payload.folderIds.split(',') if fid.strip().isdigit()]
                if payload.fromFiles and payload.fileIds:
                    file_ids_list = [int(fid) for fid in payload.fileIds.split(',') if fid.strip().isdigit()]

                send_payload = {
                    "chat_session_id": chat_id,
                    "message": wizard_message,
                    "parent_message_id": None,
                    "file_descriptors": [],
                    "user_file_ids": file_ids_list,
                    "user_folder_ids": folder_ids_list,
                    "prompt_id": None,
                    "search_doc_ids": None,
                    "retrieval_options": {"run_search": "always", "real_time": False},
                    "stream_response": True,
                }

                # Log Onyx API request
                log_onyx_request(tracker.request_id, "/chat/send-message", send_payload)

                async with client.stream("POST", f"{ONYX_API_SERVER_URL}/chat/send-message", json=send_payload, cookies=cookies) as resp:
                    tracker.add_step("lesson_onyx_stream_started", {
                        "response_status": resp.status_code
                    })

                    async for raw_line in resp.aiter_lines():
                        if not raw_line:
                            continue
                        line = raw_line.strip()
                        if line.startswith("data:"):
                            line = line.split("data:", 1)[1].strip()
                        if line == "[DONE]":
                            tracker.add_step("lesson_onyx_stream_complete", {
                                "total_chunks": chunk_count
                            })
                            break
                        try:
                            pkt = json.loads(line)
                            if "answer_piece" in pkt:
                                text_piece = pkt["answer_piece"].replace("\\n", "\n")
                                chunk_count += 1

                                # Log streaming chunks (but limit frequency)
                                if chunk_count % 10 == 0:
                                    log_streaming_chunk(tracker.request_id, "lesson_delta", len(text_piece), text_piece[:50])

                                yield text_piece.encode()
                        except Exception as e:
                            tracker.add_step("lesson_chunk_parsing_error", error=e)
                            continue

                        # Keep-alive
                        now = asyncio.get_event_loop().time()
                        if now - last_send > 8:
                            yield b" "
                            last_send = now

        tracker.add_step("lesson_streaming_complete")
        return StreamingResponse(enhanced_lesson_streamer(), media_type="text/plain")


# Example usage in main.py
def setup_enhanced_logging_in_main():
    """
    Example of how to setup enhanced logging in main.py
    """
    from enhanced_logging import setup_enhanced_logging
    
    # Setup enhanced logging
    logger = setup_enhanced_logging(is_production=False)  # Set to True for production
    
    # Create logs directory if it doesn't exist
    import os
    os.makedirs("logs", exist_ok=True)
    
    # Add file handler for persistent logs
    import logging.handlers
    file_handler = logging.handlers.RotatingFileHandler(
        'logs/app.log',
        maxBytes=100*1024*1024,  # 100MB
        backupCount=5
    )
    file_handler.setFormatter(logging.Formatter('%(message)s'))
    logging.getLogger().addHandler(file_handler)
    
    return logger


if __name__ == "__main__":
    print("Enhanced Logging Integration Example")
    print("====================================")
    print()
    print("1. Import the enhanced logging module:")
    print("   from enhanced_logging import *")
    print()
    print("2. Setup enhanced logging in main.py:")
    print("   logger = setup_enhanced_logging(is_production=False)")
    print()
    print("3. Add logging to your preview endpoints:")
    print("   - Use create_request_id() to generate unique request IDs")
    print("   - Use log_preview_step() to log each step")
    print("   - Use log_onyx_request() to log API calls")
    print("   - Use log_streaming_chunk() to log streaming responses")
    print("   - Use RequestTracker() context manager for easier tracking")
    print()
    print("4. Check the logs:")
    print("   tail -f logs/app.log | grep 'your_request_id'")
    print()
    print("See LOGGING_GUIDE.md for detailed instructions.") 