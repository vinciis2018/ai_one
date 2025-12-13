from fastapi import APIRouter, HTTPException, status
import json
import re
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import requests
import logging
import pdfplumber
import pandas as pd
import io
import base64
from fastapi import APIRouter, HTTPException, status, UploadFile, File
from fastapi.responses import StreamingResponse
from app.llms.gemini import call_gemini



router = APIRouter()

logger = logging.getLogger(__name__)

class GoogleEmailRequest(BaseModel):
    token: str
    limit: Optional[int] = 10

class GoogleAttachmentRequest(BaseModel):
    token: str
    message_id: str
    attachment_id: str
    format_instructions: Optional[str] = None


def get_attachments_metadata(parts: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Recursively search for attachments in message parts"""
    attachments = []
    if not parts:
        return attachments
        
    for part in parts:
        if part.get("filename") and part.get("body", {}).get("attachmentId"):
            attachments.append({
                "filename": part["filename"],
                "mimeType": part.get("mimeType"),
                "attachmentId": part["body"]["attachmentId"],
                "size": part["body"].get("size")
            })
        
        # Recursively check sub-parts
        if part.get("parts"):
            attachments.extend(get_attachments_metadata(part["parts"]))
            
    return attachments


@router.post("/get-emails")
async def get_emails(request: GoogleEmailRequest):
    """
    Fetch emails from the user's Gmail account using the provided access token.
    Requires scope: https://www.googleapis.com/auth/gmail.readonly
    """
    try:
        access_token = request.token
        limit = request.limit
        
        # DEBUG: Log token details to identify if it's an ID Token (JWT) or Access Token
        token_prefix = access_token[:10] if access_token else "None"
        is_jwt = len(access_token.split('.')) == 3 if access_token else False
        logger.info(f"Received Token Prefix: {token_prefix}..., Length: {len(access_token)}, Is Likely JWT: {is_jwt}")

        headers = {
            "Authorization": f"Bearer {access_token}",
            "Accept": "application/json"
        }
        
        # 1. List messages
        list_url = "https://gmail.googleapis.com/gmail/v1/users/me/messages"
        params = {
            "maxResults": limit,
            "q": "category:primary" # Optional: filter for primary inbox
        }
        
        response = requests.get(list_url, headers=headers, params=params)
        
        if response.status_code != 200:
            logger.error(f"Gmail API List Error: {response.text}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to fetch emails from Google: {response.text}"
            )
            
        data = response.json()
        messages = data.get("messages", [])
        
        results = []
        
        # 2. Fetch details for each message
        # Note: In a production app, we might want to do this in parallel or batch
        for msg in messages:
            msg_id = msg["id"]
            detail_url = f"https://gmail.googleapis.com/gmail/v1/users/me/messages/{msg_id}"
            
            detail_response = requests.get(detail_url, headers=headers)
            if detail_response.status_code == 200:
                msg_data = detail_response.json()
                payload = msg_data.get("payload", {})
                headers_list = payload.get("headers", [])
                
                subject = next((h["value"] for h in headers_list if h["name"] == "Subject"), "(No Subject)")
                sender = next((h["value"] for h in headers_list if h["name"] == "From"), "Unknown")
                date = next((h["value"] for h in headers_list if h["name"] == "Date"), "")
                snippet = msg_data.get("snippet", "")
                
                # Extract attachments
                attachments = get_attachments_metadata(payload.get("parts", []))

                results.append({
                    "id": msg_id,
                    "subject": subject,
                    "from": sender,
                    "date": date,
                    "snippet": snippet,
                    "attachments": attachments
                })
                
        return {"emails": results}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching emails: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/email/get-attachment")
async def get_attachment(request: GoogleAttachmentRequest):
    """
    Fetch a specific attachment from a message.
    """
    try:
        headers = {
            "Authorization": f"Bearer {request.token}",
            "Accept": "application/json"
        }
        
        url = f"https://gmail.googleapis.com/gmail/v1/users/me/messages/{request.message_id}/attachments/{request.attachment_id}"
        
        response = requests.get(url, headers=headers)
        
        if response.status_code != 200:
             logger.error(f"Gmail API Attachment Error: {response.text}")
             raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to fetch attachment: {response.text}"
             )
             
        data = response.json()
        # attachment data is base64url encoded in 'data' field
        return data

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching attachment: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/pdf-to-excel")
async def pdf_to_excel(request: GoogleAttachmentRequest):
    """
    Fetch a PDF attachment from Gmail and convert it to an Excel sheet.
    """
    try:
        # 1. Fetch attachment content from Gmail
        headers = {
            "Authorization": f"Bearer {request.token}",
            "Accept": "application/json"
        }
        
        url = f"https://gmail.googleapis.com/gmail/v1/users/me/messages/{request.message_id}/attachments/{request.attachment_id}"
        
        response = requests.get(url, headers=headers)
        
        if response.status_code != 200:
             logger.error(f"Gmail API Attachment Error: {response.text}")
             raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to fetch attachment: {response.text}"
             )
             
        data = response.json()
        file_data_b64 = data.get("data")
        
        if not file_data_b64:
            raise HTTPException(status_code=400, detail="No attachment data found")
            
        # Decode Base64Url
        # Replace - with + and _ with /
        file_data_b64_clean = file_data_b64.replace('-', '+').replace('_', '/')
        content = base64.b64decode(file_data_b64_clean)
        
        # 2. Proceed with PDF-to-Excel conversion
        # Open PDF from bytes
        # Note: pdfplumber expects a file-like object
        with pdfplumber.open(io.BytesIO(content)) as pdf:
            all_tables = []
            
            # Define default format instructions (Logic: If none provided, assume DSR Invoice extraction)
            request_format = request.format_instructions or """
                  Extract all invoice line items into a Daily Sales Report (DSR) format. For each line item in the invoice, create a row with the following columns: 'Date' (invoice date), 'Invoice No' (invoice number), 'Customer Name' (bill to name), 'Item Description' (product/service name), 'Quantity', 'Unit Price', 'Total Amount' (line total). Ensure all dates are in YYYY-MM-DD format. If there are multiple items in one invoice, list them as separate rows repeating the invoice Date, No, and Customer Name.
                """

            # Check if format instructions are provided (now likely True due to default)
            if request_format:
                # LLM-based extraction
                full_text = ""
                for page in pdf.pages:
                    text = page.extract_text()
                    if text:
                        full_text += text + "\n"
                
                if not full_text.strip():
                    raise HTTPException(status_code=400, detail="Could not extract text from PDF for LLM processing")

                # Construct prompt
                prompt = f"""
                You are a data extraction assistant.
                Process the following text extracted from a PDF and structure it into a JSON list of objects based on the user's instructions.
                
                USER INSTRUCTIONS: {request_format}
                
                PDF CONTENT:
                {full_text} 
                
                OUTPUT FORMAT:
                Return ONLY a valid JSON array of objects. Do not wrap in markdown code blocks.
                Example: [{{"column1": "value", "column2": "value"}}, ...]
                """
                # Truncating text to avoid generic context limit if necessary, though Gemini handles large context well.
                
                response_text = call_gemini(prompt)
                
                print(response_text)
                
                # Clean response
                if response_text.startswith("```json"):
                    response_text = response_text[7:]
                if response_text.startswith("```"):
                    response_text = response_text[3:]
                if response_text.endswith("```"):
                    response_text = response_text[:-3]
                
                try:
                    data_list = json.loads(response_text)
                    if isinstance(data_list, list) and len(data_list) > 0:
                        df = pd.DataFrame(data_list)
                        all_tables.append(df)
                    else:
                        logger.warning(f"LLM returned invalid structure: {response_text[:100]}")
                except json.JSONDecodeError as e:
                    logger.error(f"Failed to parse LLM JSON: {e}. content: {response_text}")
                    raise HTTPException(status_code=500, detail="Failed to parse LLM output")
            
            else:
                # Existing Logic: Extract tables directly
                for i, page in enumerate(pdf.pages):
                    tables = page.extract_tables()
                    for table in tables:
                        # Convert list of lists to DataFrame
                        if table:
                             # logic: if first row is non-empty, use it as header
                             df = pd.DataFrame(table[1:], columns=table[0]) if len(table) > 1 else pd.DataFrame(table)
                             all_tables.append(df)
            
            if not all_tables:
                raise HTTPException(status_code=400, detail="No tables found in the PDF")
            
            # Save to Excel buffer
            output = io.BytesIO()
            
            with pd.ExcelWriter(output, engine='openpyxl') as writer:
                for i, df in enumerate(all_tables):
                     sheet_name = f"Table_{i+1}"
                     df.to_excel(writer, sheet_name=sheet_name[:31], index=False)
            
            output.seek(0)
            
            filename = f"converted_attachment_{request.attachment_id[:8]}.xlsx"
            headers = {
                'Content-Disposition': f'attachment; filename="{filename}"'
            }
            
            return StreamingResponse(
                output, 
                media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                headers=headers
            )

    except Exception as e:
        logger.error(f"Error converting PDF Attachment to Excel: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Conversion failed: {str(e)}"
        )

