# app/dependencies.py
"""FastAPI dependency utilities.
Provides DB session and user authentication helpers supporting both
Authorization: Bearer <token> headers and HttpOnly access_token cookies.
"""

from typing import Optional
from fastapi import Depends, HTTPException, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.models.database import get_db
from app.models.user import User
from app.security import decode_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

async def get_current_user_optional(
    request: Request,
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """Retrieve the current user from Authorization header or HttpOnly cookie."""
    token_str = token
    if not token_str:
        token_str = request.cookies.get("access_token")
    if not token_str:
        return None
    try:
        payload = decode_token(token_str)
        user_id = int(payload.get("sub"))
    except Exception:
        return None
    return db.query(User).filter(User.id == user_id, User.is_active == True).first()

async def get_current_user(
    user: Optional[User] = Depends(get_current_user_optional)
) -> User:
    """Validate token and retrieve user. Raises 401 if unauthenticated."""
    if user is None:
        raise HTTPException(status_code=401, detail="Could not validate credentials")
    return user
