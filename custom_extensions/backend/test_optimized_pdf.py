#!/usr/bin/env python3
"""
Test script for optimized PDF generation with dynamic height.
This script tests the new batch processing and resource management features.
"""

import asyncio
import os
import sys
import time
import logging
from pathlib import Path

# Add the backend directory to the Python path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

from app.services.pdf_generator import (
    calculate_slide_dimensions,
    generate_single_slide_pdf,
    generate_slide_deck_pdf_with_dynamic_height,
    PDF_MIN_SLIDE_HEIGHT,
    PDF_MAX_SLIDE_HEIGHT,
    MAX_CONCURRENT_SLIDES
)

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Test data for various slide types
test_slides = [
    {
        "id": 1,
        "type": "title-slide",
        "title": "Test Presentation",
        "subtitle": "Optimized PDF Generation",
        "content": "This is a test presentation to verify the optimized PDF generation process."
    },
    {
        "id": 2,
        "type": "bullet-points",
        "title": "Key Features",
        "content": [
            "Dynamic height calculation",
            "Batch processing for better performance",
            "Improved resource management",
            "Parallel slide generation",
            "Memory optimization",
            "Timeout handling"
        ]
    },
    {
        "id": 3,
        "type": "two-column",
        "title": "Comparison Analysis",
        "leftTitle": "Before Optimization",
        "leftContent": [
            "Sequential processing",
            "Single browser instance",
            "Memory leaks",
            "Connection timeouts"
        ],
        "rightTitle": "After Optimization",
        "rightContent": [
            "Batch processing",
            "Multiple browser instances",
            "Proper cleanup",
            "Stable connections"
        ]
    },
    {
        "id": 4,
        "type": "big-numbers",
        "title": "Performance Metrics",
        "numbers": [
            {"number": "60s", "label": "Timeout Limit"},
            {"number": "3", "label": "Concurrent Slides"},
            {"number": "1024MB", "label": "Memory Limit"},
            {"number": "600-3000px", "label": "Height Range"}
        ]
    },
    {
        "id": 5,
        "type": "four-box-grid",
        "title": "Technical Architecture",
        "boxes": [
            {"title": "Height Calculation", "content": "Pre-calculate slide dimensions"},
            {"title": "Batch Processing", "content": "Process slides in parallel batches"},
            {"title": "Resource Management", "content": "Proper cleanup and garbage collection"},
            {"title": "Error Handling", "content": "Robust error recovery and logging"}
        ]
    },
    {
        "id": 6,
        "type": "timeline",
        "title": "Development Timeline",
        "events": [
            {"date": "Phase 1", "title": "Dynamic Height", "description": "Implemented per-slide height calculation"},
            {"date": "Phase 2", "title": "Style Fixes", "description": "Fixed template rendering issues"},
            {"date": "Phase 3", "title": "Performance", "description": "Optimized resource management and batch processing"},
            {"date": "Phase 4", "title": "Testing", "description": "Comprehensive testing and validation"}
        ]
    },
    {
        "id": 7,
        "type": "bullet-points-right",
        "title": "Implementation Details",
        "content": [
            "Browser instance management",
            "Memory leak prevention",
            "Timeout configuration",
            "Error recovery mechanisms"
        ]
    },
    {
        "id": 8,
        "type": "big-image-top",
        "title": "System Architecture",
        "content": "The optimized PDF generation system uses a multi-stage approach with proper resource management and parallel processing capabilities."
    },
    {
        "id": 9,
        "type": "two-column-diversity",
        "title": "Diversity and Inclusion",
        "leftTitle": "Inclusive Design",
        "leftContent": "Ensuring accessibility and usability for all users",
        "rightTitle": "Best Practices",
        "rightContent": [
            "Accessible color schemes",
            "Readable typography",
            "Clear content structure",
            "Responsive layouts"
        ]
    },
    {
        "id": 10,
        "type": "challenges-solutions",
        "title": "Problem Resolution",
        "challenges": [
            "Connection timeouts during PDF generation",
            "Memory leaks from browser instances",
            "Slow processing for large slide decks",
            "Inconsistent error handling"
        ],
        "solutions": [
            "Increased timeout limits and better error handling",
            "Proper browser cleanup and garbage collection",
            "Batch processing with parallel execution",
            "Comprehensive logging and monitoring"
        ]
    }
]

async def test_slide_height_calculation():
    """Test individual slide height calculation."""
    logger.info("Testing slide height calculation...")
    
    for i, slide_data in enumerate(test_slides):
        try:
            start_time = time.time()
            height = await calculate_slide_dimensions(slide_data, "default")
            end_time = time.time()
            
            logger.info(f"Slide {i + 1} ({slide_data['type']}): {height}px (calculated in {end_time - start_time:.2f}s)")
            
            # Validate height is within expected range
            assert PDF_MIN_SLIDE_HEIGHT <= height <= PDF_MAX_SLIDE_HEIGHT, f"Height {height}px is outside valid range"
            
        except Exception as e:
            logger.error(f"Failed to calculate height for slide {i + 1}: {e}")
            raise

async def test_single_slide_pdf():
    """Test individual slide PDF generation."""
    logger.info("Testing single slide PDF generation...")
    
    for i, slide_data in enumerate(test_slides[:3]):  # Test first 3 slides
        try:
            start_time = time.time()
            height = await calculate_slide_dimensions(slide_data, "default")
            output_path = f"/tmp/test_slide_{i + 1}_{int(time.time())}.pdf"
            
            success = await generate_single_slide_pdf(slide_data, "default", height, output_path)
            end_time = time.time()
            
            if success and os.path.exists(output_path):
                file_size = os.path.getsize(output_path)
                logger.info(f"Slide {i + 1} PDF: {file_size} bytes (generated in {end_time - start_time:.2f}s)")
                
                # Clean up test file
                os.remove(output_path)
            else:
                logger.error(f"Failed to generate PDF for slide {i + 1}")
                raise Exception(f"PDF generation failed for slide {i + 1}")
                
        except Exception as e:
            logger.error(f"Failed to test single slide PDF for slide {i + 1}: {e}")
            raise

async def test_slide_deck_pdf():
    """Test full slide deck PDF generation with optimization."""
    logger.info("Testing optimized slide deck PDF generation...")
    
    try:
        start_time = time.time()
        output_filename = f"test_optimized_deck_{int(time.time())}.pdf"
        
        pdf_path = await generate_slide_deck_pdf_with_dynamic_height(
            slides_data=test_slides,
            theme="default",
            output_filename=output_filename,
            use_cache=False  # Don't use cache for testing
        )
        
        end_time = time.time()
        
        if os.path.exists(pdf_path):
            file_size = os.path.getsize(pdf_path)
            logger.info(f"Slide deck PDF: {file_size} bytes (generated in {end_time - start_time:.2f}s)")
            
            # Clean up test file
            os.remove(pdf_path)
            logger.info("Test completed successfully!")
        else:
            logger.error("Generated PDF file not found")
            raise Exception("PDF file not found after generation")
            
    except Exception as e:
        logger.error(f"Failed to test slide deck PDF generation: {e}")
        raise

async def test_batch_processing():
    """Test batch processing with different batch sizes."""
    logger.info("Testing batch processing...")
    
    # Test with different batch sizes
    for batch_size in [1, 2, 3, 5]:
        logger.info(f"Testing with batch size: {batch_size}")
        
        # Temporarily modify the MAX_CONCURRENT_SLIDES
        original_batch_size = MAX_CONCURRENT_SLIDES
        import app.services.pdf_generator as pdf_module
        pdf_module.MAX_CONCURRENT_SLIDES = batch_size
        
        try:
            start_time = time.time()
            output_filename = f"test_batch_{batch_size}_{int(time.time())}.pdf"
            
            pdf_path = await generate_slide_deck_pdf_with_dynamic_height(
                slides_data=test_slides[:6],  # Use first 6 slides for batch testing
                theme="default",
                output_filename=output_filename,
                use_cache=False
            )
            
            end_time = time.time()
            
            if os.path.exists(pdf_path):
                file_size = os.path.getsize(pdf_path)
                logger.info(f"Batch {batch_size} PDF: {file_size} bytes (generated in {end_time - start_time:.2f}s)")
                os.remove(pdf_path)
            else:
                logger.error(f"Batch {batch_size} PDF file not found")
                
        except Exception as e:
            logger.error(f"Failed to test batch size {batch_size}: {e}")
        finally:
            # Restore original batch size
            pdf_module.MAX_CONCURRENT_SLIDES = original_batch_size

async def test_error_handling():
    """Test error handling with invalid data."""
    logger.info("Testing error handling...")
    
    # Test with invalid slide data
    invalid_slides = [
        {"id": 1, "type": "invalid-type", "title": "Invalid Slide"},
        {"id": 2, "type": "bullet-points", "title": "Slide with Missing Content"},
        None,  # Null slide
        {"id": 3, "type": "bullet-points", "title": "Valid Slide", "content": ["Item 1", "Item 2"]}
    ]
    
    try:
        output_filename = f"test_error_handling_{int(time.time())}.pdf"
        
        pdf_path = await generate_slide_deck_pdf_with_dynamic_height(
            slides_data=invalid_slides,
            theme="default",
            output_filename=output_filename,
            use_cache=False
        )
        
        if os.path.exists(pdf_path):
            logger.info("Error handling test completed - PDF generated despite invalid data")
            os.remove(pdf_path)
        else:
            logger.error("Error handling test failed - no PDF generated")
            
    except Exception as e:
        logger.info(f"Error handling test caught expected error: {e}")

async def test_memory_management():
    """Test memory management by generating multiple PDFs."""
    logger.info("Testing memory management...")
    
    try:
        for i in range(3):  # Generate 3 PDFs in sequence
            start_time = time.time()
            output_filename = f"test_memory_{i}_{int(time.time())}.pdf"
            
            pdf_path = await generate_slide_deck_pdf_with_dynamic_height(
                slides_data=test_slides,
                theme="default",
                output_filename=output_filename,
                use_cache=False
            )
            
            end_time = time.time()
            
            if os.path.exists(pdf_path):
                file_size = os.path.getsize(pdf_path)
                logger.info(f"Memory test PDF {i + 1}: {file_size} bytes (generated in {end_time - start_time:.2f}s)")
                os.remove(pdf_path)
            else:
                logger.error(f"Memory test PDF {i + 1} not found")
                
        logger.info("Memory management test completed successfully!")
        
    except Exception as e:
        logger.error(f"Memory management test failed: {e}")
        raise

async def main():
    """Run all tests."""
    logger.info("Starting optimized PDF generation tests...")
    
    try:
        # Test 1: Height calculation
        await test_slide_height_calculation()
        
        # Test 2: Single slide PDF generation
        await test_single_slide_pdf()
        
        # Test 3: Full slide deck generation
        await test_slide_deck_pdf()
        
        # Test 4: Batch processing
        await test_batch_processing()
        
        # Test 5: Error handling
        await test_error_handling()
        
        # Test 6: Memory management
        await test_memory_management()
        
        logger.info("All tests completed successfully!")
        
    except Exception as e:
        logger.error(f"Test suite failed: {e}")
        raise

if __name__ == "__main__":
    asyncio.run(main()) 