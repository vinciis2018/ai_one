import boto3
from fastapi import APIRouter, HTTPException
from app.config.settings import AWS_ACCESS_KEY, AWS_SECRET_KEY, AWS_REGION, S3_BUCKET
from pydantic import BaseModel
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


class S3UploadRequest(BaseModel):
    filename: str
    content_type: str = "application/pdf"


@router.post("/get-s3-upload-url")
async def generate_presigned_url(request: S3UploadRequest):
    """Generate a pre-signed S3 URL for uploading."""
    try:
        safe_filename = request.filename.replace(" ", "_")
        key = f"uploads/{safe_filename}"

        s3 = boto3.client(
            "s3",
            region_name=AWS_REGION,
            aws_access_key_id=AWS_ACCESS_KEY,
            aws_secret_access_key=AWS_SECRET_KEY,
        )

        # ✅ Removed ACL from Params to avoid signature mismatch
        presigned_url = s3.generate_presigned_url(
            "put_object",
            Params={
                "Bucket": S3_BUCKET,
                "Key": key,
                "ContentType": request.content_type,
            },
            HttpMethod="PUT",
            ExpiresIn=3600
        )

        return {
            "filename": request.filename,
            "upload_url": presigned_url,
            "url": f"https://{S3_BUCKET}.s3.{AWS_REGION}.amazonaws.com/{key}"
        }

    except Exception as e:
        logger.error(f"Error generating presigned URL: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating presigned URL: {str(e)}")





