from pydantic import BaseModel, Field
from typing import Optional

class RegisterRequest(BaseModel):
    phone: Optional[str] = Field(None, min_length=10, max_length=15, description="User phone (optional)")
    email: str = Field(..., description="User email address")
    password: str = Field(..., min_length=6)
    name: Optional[str] = None
    language: Optional[str] = "en"

class LoginRequest(BaseModel):
    email: str = Field(..., description="User email for login")
    password: str = Field(..., min_length=6)

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class RefreshRequest(BaseModel):
    refresh_token: str
