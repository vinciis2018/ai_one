import requests
import io
import json
import asyncio
from google import genai
from google.genai import types

async def generate_full_transcript_core(s3_url: str, document_id: str):
    """
    Core function to download PDF, upload to Gemini, and generate transcription.
    Returns the structured transcript data.
    """
    print(f"--- Starting Core Transcription Process for Document {document_id} ---")

    # 1. Initialize Gemini Client
    try:
        client = genai.Client()
    except Exception as e:
        print(f"Error initializing Gemini client: {e}")
        raise Exception("Internal Server Error: Gemini client initialization failed.")

    # 2. Download PDF from S3
    print(f"1. Downloading PDF from S3: {s3_url}")
    loop = asyncio.get_running_loop()
    try:
        response = await loop.run_in_executor(None, requests.get, s3_url)
        response.raise_for_status()
        pdf_data = response.content
        print(f"   -> Downloaded {len(pdf_data) / 1024:.2f} KB successfully.")
    except requests.exceptions.RequestException as e:
        print(f"Error downloading PDF from S3: {e}")
        raise Exception(f"Failed to download file from S3: {str(e)}")

    # 3. Upload PDF to Gemini Files API
    uploaded_file = None
    try:
        def upload_to_gemini(data):
            pdf_file_stream = io.BytesIO(data)
            return client.files.upload(
                file=pdf_file_stream,
                config=types.UploadFileConfig(
                    mime_type='application/pdf',
                    display_name=f'doc_{document_id}.pdf'
                )
            )

        uploaded_file = await loop.run_in_executor(None, upload_to_gemini, pdf_data)
        print(f"2. Uploaded file to Gemini Files API. URI: {uploaded_file.uri}")

        # 4. Define Structured Request
        output_schema = types.Schema(
            type=types.Type.ARRAY,
            items=types.Schema(
                type=types.Type.OBJECT,
                properties={
                    "page_number": types.Schema(type=types.Type.INTEGER, description="The page number of the transcript."),
                    "transcript": types.Schema(type=types.Type.STRING, description="The transcribed text of the page.")
                },
                required=["page_number", "transcript"]
            )
        )

        prompt = """
        You are a professional transcription service. The attached file is a multi-page PDF document. 
        Transcribe the full content of EVERY page individually. 
        Return a JSON array where each item represents a page and contains the 'page_number' and the 'transcript'.
        Ensure you cover ALL pages in the document.
        """

        # 5. Call Gemini Model
        print("3. Requesting page-by-page transcription...")
        
        def generate_content_call():
            return client.models.generate_content(
                model='gemini-2.0-flash-exp', 
                contents=[prompt, uploaded_file],
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=output_schema,
                )
            )

        response = await loop.run_in_executor(None, generate_content_call)

        # 6. Process Response
        print("4. Transcription received.")
        try:
            transcript_data = json.loads(response.text)
            
            if not isinstance(transcript_data, list):
                if isinstance(transcript_data, dict):
                    for key, val in transcript_data.items():
                        if isinstance(val, list):
                            transcript_data = val
                            break
            
            return transcript_data

        except json.JSONDecodeError:
            print(f"Failed to parse JSON: {response.text}")
            raise Exception("Failed to parse LLM response")

    except Exception as e:
        print(f"Error during Gemini interaction: {e}")
        raise e
        
    finally:
        # 7. Clean up
        if uploaded_file:
            try:
                await loop.run_in_executor(None, client.files.delete, uploaded_file.name)
                print(f"5. Clean up: Deleted uploaded file: {uploaded_file.uri}")
            except Exception as cleanup_error:
               print(f"Warning: Failed to delete file {uploaded_file.name}: {cleanup_error}")
