from datetime import datetime, timedelta
from typing import Optional, Dict, Any, Annotated

from fastapi import APIRouter, Depends, HTTPException, status, Request, Response, Form
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from bson import ObjectId
import bcrypt
from app.models.user import UserModel, PyObjectId
from app.config import settings
from app.config.db import db, get_collection
from pydantic import BaseModel, Field, ConfigDict, field_validator, ValidationInfo, EmailStr
# Get the users collection
users_collection = get_collection("users")

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# JWT Configuration
SECRET_KEY = "secret_key_here"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 300

class LoginRequest(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    expires_at: float
    user: Dict[str, Any]

class TokenData(BaseModel):
    email: Optional[str] = None


class UserCreate(BaseModel):
    firstName: str = Field(..., min_length=1, max_length=50)
    lastName: str = Field(..., min_length=1, max_length=50)
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=30)
    password: str
    confirmPassword: str
    role: str = "student"
    organisation_id: Optional[str] = None

    @field_validator('email')
    def validate_email(cls, v):
        if not v or '@' not in v:
            raise ValueError('Invalid email format')
        return v.lower()

    @field_validator('username')
    def validate_username(cls, v):
        if not v.isalnum():
            raise ValueError('Username must be alphanumeric')
        return v

    @field_validator('password')
    def validate_password(cls, v: str) -> str:
        return v

# Helper functions
def verify_password(plain_password, hashed_password):
    """Verify a password against its hash"""
    # Encode and truncate password the same way as during hashing
    password_bytes = plain_password.encode('utf-8')
    if len(password_bytes) > 72:
        password_bytes = password_bytes[:72]
    return bcrypt.checkpw(password_bytes, hashed_password.encode('utf-8'))


def get_password_hash(password: str) -> str:
    """Hash a password using bcrypt (handles 72-byte limit)"""
    # Encode password to bytes and truncate to 72 bytes if needed
    password_bytes = password.encode('utf-8')
    if len(password_bytes) > 72:
        password_bytes = password_bytes[:72]
    
    # Generate salt and hash
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')

async def get_user(email: str):
    user = await users_collection.find_one({"email": email})
    if user:
        return UserModel(**user)
    return None

async def authenticate_user(email: str, password: str):
    user = await get_user(email)
    if not user or not verify_password(password, user.password):
        return False
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now() + expires_delta
    else:
        expire = datetime.now() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
    
    user = await get_user(email=token_data.email)
    if user is None:
        raise credentials_exception
    return user

# Routes
@router.post("/signup", response_model=Token, status_code=status.HTTP_201_CREATED)
async def signup(user_data: UserCreate):
    try:
        # Check if user already exists
        existing_user = await users_collection.find_one({
            "$or": [
                {"email": user_data.email},
                {"username": user_data.username}
            ]
        })
        
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email or username already registered"
            )
        
        # Hash password
        hashed_password = get_password_hash(user_data.password)

        # Create new user
        user_dict = user_data.model_dump()
        user_dict.pop('confirmPassword', None)
        user_dict.pop('password', None)

        # Add additional fields
        user_dict.update({
            "password": hashed_password,
            "is_active": True,
            "created_at": datetime.now(),
            "updated_at": datetime.now(),
            "full_name": f"{user_data.firstName} {user_data.lastName}"
        })
        
        # Insert user into database
        result = await users_collection.insert_one(user_dict)
        created_user = await users_collection.find_one({"_id": result.inserted_id})
        
        # Create access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        expires_at = datetime.now() + access_token_expires
        expires_at_timestamp = int(expires_at.timestamp() * 1000)
        access_token = create_access_token(
            data={"sub": user_data.email}, 
            expires_delta=access_token_expires
        )

        # Prepare user data for response
        user_dict = created_user
        user_data_response = {
            "_id": str(user_dict.get("_id")),
            "email": user_dict.get("email"),
            "username": user_dict.get("username"),
            "firstName": user_dict.get("firstName"),
            "lastName": user_dict.get("lastName"),
            "role": user_dict.get("role", "student"),
            "is_active": user_dict.get("is_active", True),
            "full_name": user_dict.get("full_name"),
        }
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "expires_at": expires_at_timestamp,
            "user": user_data_response
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Signup error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/login", response_model=Token)
async def login(
    login_data: LoginRequest
):
    email = login_data.email
    password = login_data.password
    user = await authenticate_user(email, password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Update last login time
    await users_collection.update_one(
        {"_id": user.id},
        {"$set": {"last_login": datetime.now()}}
    )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    expires_at = datetime.now() + access_token_expires
    expires_at_timestamp = int(expires_at.timestamp() * 1000) 
    access_token = create_access_token(
        data={"sub": user.email}, 
        expires_delta=access_token_expires
    )
 
   # Convert user to dict and handle the ID properly
    user_dict = user.model_dump() if hasattr(user, 'model_dump') else dict(user)
     # Prepare user data for response
    user_data = {
        "_id": str(user_dict.get("_id") or user_dict.get("id")),
        "email": user_dict.get("email"),
        "username": user_dict.get("username"),
        "firstName": user_dict.get("firstName"),
        "lastName": user_dict.get("lastName"),
        "role": user_dict.get("role", "student"),
        "is_active": user_dict.get("is_active", True),
        "full_name": user_dict.get("full_name"),
    }

    result = {
         "access_token": access_token,
        "token_type": "bearer",
        "expires_at": expires_at_timestamp,
        "user": user_data
    }
    print("tyy", result)

    return result

@router.post("/logout")
async def logout(response: Response):
    # In a stateless JWT system, logout is handled client-side by removing the token
    # We can also implement token blacklisting here if needed
    response.delete_cookie("access_token")
    return {"message": "Successfully logged out"}


@router.get("/me", response_model=UserModel)
async def get_current_user_details(current_user: UserModel = Depends(get_current_user)):
    # Remove sensitive data before returning
    user_data = current_user.model_dump()
    user_data.pop("password", None)

    student = await db["students"].find_one({"user_id": ObjectId(user_data["id"])})
    teacher = await db["teachers"].find_one({"user_id": ObjectId(user_data["id"])})
    if student:
        user_data["student_id"] = str(student["_id"])
    if teacher:
        user_data["teacher_id"] = str(teacher["_id"])

    return UserModel(**user_data)