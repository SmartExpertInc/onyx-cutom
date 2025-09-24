#!/usr/bin/env python3
"""
Course Outline HTML Generator

This script generates an HTML file from a course outline project.
It can be used to create standalone HTML files for course outlines.

Usage:
    python generate_course_outline_html.py <project_id> [output_file]

Example:
    python generate_course_outline_html.py 123 course_outline.html
"""

import os
import sys
import json
import asyncio
import asyncpg
from datetime import datetime
from jinja2 import Environment, FileSystemLoader
import argparse

# Database configuration
CUSTOM_PROJECTS_DATABASE_URL = os.getenv("CUSTOM_PROJECTS_DATABASE_URL", "postgresql://user:password@localhost:5432/custom_projects")

async def fetch_project_data(project_id: int, onyx_user_id: str = "dummy-onyx-user-id-for-testing"):
    """Fetch project data from the database"""
    try:
        conn = await asyncpg.connect(CUSTOM_PROJECTS_DATABASE_URL)
        
        # Fetch project data
        target_row_dict = await conn.fetchrow(
            "SELECT * FROM projects WHERE id = $1 AND onyx_user_id = $2",
            project_id, onyx_user_id
        )
        
        await conn.close()
        
        if not target_row_dict:
            raise ValueError(f"Project {project_id} not found")
        
        return dict(target_row_dict)
        
    except Exception as e:
        print(f"Error fetching project data: {e}")
        raise

def create_slug(text: str) -> str:
    """Create a URL-friendly slug from text"""
    import re
    # Convert to lowercase and replace spaces/special chars with hyphens
    slug = re.sub(r'[^\w\s-]', '', text.lower())
    slug = re.sub(r'[-\s]+', '-', slug)
    return slug.strip('-')

def generate_html_file(project_data: dict, output_file: str = None):
    """Generate HTML file from project data"""
    try:
        # Get project details
        project_name = project_data.get('project_name', 'Course Outline')
        microproduct_content = project_data.get('microproduct_content')
        project_id = project_data.get('id')
        
        if not microproduct_content:
            raise ValueError("No course outline data found")
        
        # Prepare template data
        template_data = {
            "details": microproduct_content,
            "project_name": project_name,
            "project_id": project_id
        }
        
        # Set up Jinja2 environment
        template_dir = os.path.join(os.path.dirname(__file__), 'custom_extensions', 'backend', 'templates')
        env = Environment(loader=FileSystemLoader(template_dir))
        template = env.get_template('course_outline_pdf_template.html')
        
        # Render the template
        html_content = template.render(**template_data)
        
        # Generate output filename if not provided
        if not output_file:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            slug = create_slug(project_name)
            output_file = f"course_outline_{slug}_{timestamp}.html"
        
        # Write HTML file
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(html_content)
        
        print(f"HTML file generated successfully: {output_file}")
        print(f"File size: {os.path.getsize(output_file)} bytes")
        
        return output_file
        
    except Exception as e:
        print(f"Error generating HTML file: {e}")
        raise

async def main():
    """Main function"""
    parser = argparse.ArgumentParser(description='Generate HTML file from course outline project')
    parser.add_argument('project_id', type=int, help='Project ID to generate HTML for')
    parser.add_argument('output_file', nargs='?', help='Output HTML file path (optional)')
    parser.add_argument('--user-id', default='dummy-onyx-user-id-for-testing', help='Onyx user ID (default: dummy-onyx-user-id-for-testing)')
    
    args = parser.parse_args()
    
    try:
        print(f"Fetching project data for project ID: {args.project_id}")
        project_data = await fetch_project_data(args.project_id, args.user_id)
        
        print(f"Project found: {project_data.get('project_name', 'Unknown')}")
        
        print("Generating HTML file...")
        output_file = generate_html_file(project_data, args.output_file)
        
        print(f"✅ Success! HTML file created: {output_file}")
        print(f"You can open this file in a web browser to view the course outline.")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
