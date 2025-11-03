from pydantic import BaseModel
from bson import ObjectId


class UploadResponse(BaseModel):
  filename: str
  text_preview: str
  chunks: int


class QueryRequest(BaseModel):
  question: str


class QueryResponse(BaseModel):
  answer: str
  context_used: list[str]


# =====================================================
# Helper class for ObjectId conversion (Mongo compatibility)
# =====================================================
class PyObjectId(ObjectId):
    @classmethod
    def __get_pydantic_core_schema__(cls, _source_type, _handler):
        def validate(value: str) -> ObjectId:
            if not ObjectId.is_valid(value):
                raise ValueError("Invalid ObjectId")
            return ObjectId(value)
        
        from pydantic_core import core_schema
        return core_schema.no_info_plain_validator_function(
            function=validate,
            serialization=core_schema.to_string_ser_schema(),
        )
