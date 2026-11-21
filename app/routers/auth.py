import base64
from datetime import datetime, timedelta, timezone
import hashlib
import os
import secrets
from urllib.parse import quote_plus, urlencode

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.responses import JSONResponse, RedirectResponse
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
import jwt
import requests
from sqlalchemy.orm import Session

from app.config import settings
from app.dependencies import get_current_user, get_db
from app.models.user import RefreshToken, User
from app.schemas.auth import LoginRequest, RefreshRequest, RegisterRequest, TokenResponse
from app.security import (
    ALGORITHM,
    SECRET_KEY,
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])

def _generate_pkce_pair():
    """Generates a high-entropy PKCE code_verifier and S256 code_challenge."""
    verifier = secrets.token_urlsafe(64)
    digest = hashlib.sha256(verifier.encode("utf-8")).digest()
    challenge = base64.urlsafe_b64encode(digest).decode("utf-8").rstrip("=")
    return verifier, challenge

def _create_state_token(state: str, code_verifier: str, next_url: str = "/") -> str:
    """Signs state, PKCE verifier, and return path into a tamper-proof short-lived JWT."""
    payload = {
        "state": state,
        "code_verifier": code_verifier,
        "next": next_url,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=10),
    }
    return jwt.encode(payload, settings.secret_key, algorithm=ALGORITHM)

def _decode_state_token(token: str) -> dict:
    return jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])

def _set_auth_cookie(response: Response, access_token: str, request: Request):
    is_secure = request.url.scheme == "https"
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        samesite="lax",
        secure=is_secure,
        max_age=30 * 60,  # 30 minutes
        path="/",
    )

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(request: RegisterRequest, req: Request, response: Response, db: Session = Depends(get_db)):
    # Check for existing phone or email
    if request.phone:
        existing_phone = db.query(User).filter(User.phone == request.phone).first()
        if existing_phone:
            raise HTTPException(status_code=400, detail="Phone already registered")
    if request.email:
        existing_email = db.query(User).filter(User.email == request.email.lower()).first()
        if existing_email:
            raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        phone=request.phone,
        email=request.email.lower() if request.email else None,
        password_hash=hash_password(request.password),
        name=request.name,
        language=request.language or "en",
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    access = create_access_token({"sub": str(user.id)})
    refresh = create_refresh_token(user.id)
    token_hash = hashlib.sha256(refresh.encode()).hexdigest()
    rt = RefreshToken(user_id=user.id, token_hash=token_hash, expires_at=datetime.now(timezone.utc).replace(tzinfo=None) + timedelta(days=7))
    db.add(rt)
    db.commit()

    _set_auth_cookie(response, access, req)
    return TokenResponse(access_token=access, refresh_token=refresh)

@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest, req: Request, response: Response, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email.lower()).first()
    if not user or not user.password_hash or not verify_password(request.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access = create_access_token({"sub": str(user.id)})
    refresh = create_refresh_token(user.id)
    token_hash = hashlib.sha256(refresh.encode()).hexdigest()
    rt = RefreshToken(user_id=user.id, token_hash=token_hash, expires_at=datetime.now(timezone.utc).replace(tzinfo=None) + timedelta(days=7))
    db.add(rt)
    db.commit()

    _set_auth_cookie(response, access, req)
    return TokenResponse(access_token=access, refresh_token=refresh)

@router.get("/me")
def get_current_user_profile(user: User = Depends(get_current_user)):
    """Returns profile for currently authenticated user."""
    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "avatar": user.avatar,
        "google_sub": user.google_sub,
        "phone": user.phone,
        "language": user.language,
        "state": user.state,
        "district": user.district,
        "taluk": user.taluk,
        "village": user.village,
    }

@router.get("/google/url")
def get_google_auth_url(next: str = "/", req: Request = None, response: Response = None):
    """Generates Google OAuth 2.0 / OpenID Connect authorization URL with state and PKCE."""
    client_id = settings.google_client_id.strip()
    if not client_id:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google Sign-In is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env"
        )

    state = secrets.token_urlsafe(32)
    code_verifier, code_challenge = _generate_pkce_pair()
    state_token = _create_state_token(state, code_verifier, next)

    redirect_uri = settings.google_redirect_uri.strip()
    if not redirect_uri:
        # Fallback to current request host
        scheme = req.url.scheme if req else "http"
        host = req.headers.get("host") if req else "localhost:5000"
        redirect_uri = f"{scheme}://{host}/api/auth/google/callback"

    params = {
        "response_type": "code",
        "client_id": client_id,
        "redirect_uri": redirect_uri,
        "scope": "openid email profile",
        "state": state,
        "code_challenge": code_challenge,
        "code_challenge_method": "S256",
        "prompt": "select_account",
        "access_type": "online",
    }
    auth_url = f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"

    res = JSONResponse(content={"url": auth_url, "state": state})
    is_secure = req.url.scheme == "https" if req else False
    res.set_cookie(
        key="oauth_state",
        value=state_token,
        httponly=True,
        samesite="lax",
        secure=is_secure,
        max_age=10 * 60,  # 10 minutes
        path="/",
    )
    return res

@router.get("/google/login")
def google_login_redirect(next: str = "/", req: Request = None):
    """Direct browser redirect to Google OAuth authorization endpoint."""
    client_id = settings.google_client_id.strip()
    if not client_id:
        return RedirectResponse(
            url=f"/login?error={quote_plus('Google Sign-In is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.')}",
            status_code=303
        )

    state = secrets.token_urlsafe(32)
    code_verifier, code_challenge = _generate_pkce_pair()
    state_token = _create_state_token(state, code_verifier, next)

    redirect_uri = settings.google_redirect_uri.strip()
    if not redirect_uri:
        scheme = req.url.scheme if req else "http"
        host = req.headers.get("host") if req else "localhost:5000"
        redirect_uri = f"{scheme}://{host}/api/auth/google/callback"

    params = {
        "response_type": "code",
        "client_id": client_id,
        "redirect_uri": redirect_uri,
        "scope": "openid email profile",
        "state": state,
        "code_challenge": code_challenge,
        "code_challenge_method": "S256",
        "prompt": "select_account",
        "access_type": "online",
    }
    auth_url = f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"
    response = RedirectResponse(url=auth_url, status_code=303)
    is_secure = req.url.scheme == "https" if req else False
    response.set_cookie(
        key="oauth_state",
        value=state_token,
        httponly=True,
        samesite="lax",
        secure=is_secure,
        max_age=10 * 60,
        path="/",
    )
    return response

@router.get("/google/callback")
def google_callback(
    req: Request,
    code: str = None,
    state: str = None,
    error: str = None,
    error_description: str = None,
    db: Session = Depends(get_db)
):
    """
    Handles Google OAuth 2.0 / OpenID Connect authorization code callback.
    - Validates PKCE and state
    - Exchanges code for tokens
    - Verifies ID token signature, audience, issuer, expiry, and email_verified
    - Enforces @gmail.com accounts only
    - Creates or links user by google_sub and email
    - Establishes HttpOnly SameSite session cookie
    """
    # 1. Handle error reported by Google (e.g. user cancelled consent)
    if error:
        err_msg = "Google sign-in was cancelled." if ("denied" in error.lower() or "cancel" in error.lower()) else (error_description or error)
        return RedirectResponse(url=f"/login?error={quote_plus(err_msg)}", status_code=303)

    if not code or not state:
        return RedirectResponse(url=f"/login?error={quote_plus('Missing authorization code or state parameter.')}", status_code=303)

    # 2. Retrieve and verify state & PKCE code_verifier from HttpOnly cookie
    oauth_cookie = req.cookies.get("oauth_state")
    if not oauth_cookie:
        return RedirectResponse(url=f"/login?error={quote_plus('OAuth session expired or cookies disabled. Please try again.')}", status_code=303)

    try:
        state_data = _decode_state_token(oauth_cookie)
    except jwt.ExpiredSignatureError:
        return RedirectResponse(url=f"/login?error={quote_plus('OAuth session timed out. Please try again.')}", status_code=303)
    except Exception:
        return RedirectResponse(url=f"/login?error={quote_plus('Invalid OAuth state signature. Please try again.')}", status_code=303)

    if state_data.get("state") != state:
        return RedirectResponse(url=f"/login?error={quote_plus('State mismatch detected (CSRF protection). Please try again.')}", status_code=303)

    code_verifier = state_data.get("code_verifier")
    next_url = state_data.get("next") or "/"

    # 3. Exchange authorization code + code_verifier for tokens at Google Token Endpoint
    client_id = settings.google_client_id.strip()
    client_secret = settings.google_client_secret.strip()
    redirect_uri = settings.google_redirect_uri.strip()
    if not redirect_uri:
        scheme = req.url.scheme
        host = req.headers.get("host")
        redirect_uri = f"{scheme}://{host}/api/auth/google/callback"

    token_url = "https://oauth2.googleapis.com/token"
    token_payload = {
        "client_id": client_id,
        "client_secret": client_secret,
        "code": code,
        "code_verifier": code_verifier,
        "grant_type": "authorization_code",
        "redirect_uri": redirect_uri,
    }

    try:
        token_resp = requests.post(token_url, data=token_payload, timeout=10)
        if token_resp.status_code != 200:
            err_data = token_resp.json() if "application/json" in token_resp.headers.get("Content-Type", "") else {}
            detail = err_data.get("error_description") or err_data.get("error") or token_resp.text
            return RedirectResponse(url=f"/login?error={quote_plus(f'Failed to exchange authorization code: {detail}')}", status_code=303)
        tokens = token_resp.json()
    except requests.RequestException:
        return RedirectResponse(url=f"/login?error={quote_plus('Network failure communicating with Google. Please check your internet connection.')}", status_code=303)

    id_token_str = tokens.get("id_token")
    if not id_token_str:
        return RedirectResponse(url=f"/login?error={quote_plus('No ID token received from Google.')}", status_code=303)

    # 4. Verify Google ID token (signature, audience = client_id, issuer, expiry, email_verified = true)
    try:
        id_info = id_token.verify_oauth2_token(
            id_token_str,
            google_requests.Request(),
            client_id,
            clock_skew_in_seconds=10
        )
    except ValueError as ve:
        return RedirectResponse(url=f"/login?error={quote_plus(f'Invalid Google ID token: {str(ve)}')}", status_code=303)
    except Exception as e:
        return RedirectResponse(url=f"/login?error={quote_plus(f'Token verification failed: {str(e)}')}", status_code=303)

    # Validate Issuer
    if id_info.get("iss") not in ["accounts.google.com", "https://accounts.google.com"]:
        return RedirectResponse(url=f"/login?error={quote_plus('Untrusted token issuer.')}", status_code=303)

    # Validate email_verified
    if not id_info.get("email_verified"):
        return RedirectResponse(url=f"/login?error={quote_plus('Google account email is not verified.')}", status_code=303)

    # 5. Enforce Gmail accounts only: verified email must end with @gmail.com
    email = str(id_info.get("email", "")).strip().lower()
    if not email.endswith("@gmail.com"):
        return RedirectResponse(
            url=f"/login?error={quote_plus('Please sign in with a Gmail account.')}",
            status_code=303
        )

    # 6. Find or create user
    google_sub = str(id_info.get("sub"))
    name = id_info.get("name")
    avatar = id_info.get("picture")

    # Find by google_sub first
    user = db.query(User).filter(User.google_sub == google_sub).first()
    if user:
        if name and not user.name:
            user.name = name
        if avatar:
            user.avatar = avatar
        db.commit()
        db.refresh(user)
    else:
        # Check if user with this email already exists
        user = db.query(User).filter(User.email == email).first()
        if user:
            user.google_sub = google_sub
            if avatar:
                user.avatar = avatar
            if name and not user.name:
                user.name = name
            db.commit()
            db.refresh(user)
        else:
            # First login: create brand new user
            user = User(
                email=email,
                name=name,
                avatar=avatar,
                google_sub=google_sub,
                password_hash=None,
                is_active=True,
            )
            db.add(user)
            db.commit()
            db.refresh(user)

    # 7. Create session and set HttpOnly, SameSite cookie
    access = create_access_token({"sub": str(user.id)})
    refresh = create_refresh_token(user.id)
    token_hash = hashlib.sha256(refresh.encode()).hexdigest()
    rt = RefreshToken(user_id=user.id, token_hash=token_hash, expires_at=datetime.now(timezone.utc).replace(tzinfo=None) + timedelta(days=7))
    db.add(rt)
    db.commit()

    target_url = next_url if (next_url and next_url.startswith("/") and not next_url.startswith("//")) else "/"
    response = RedirectResponse(url=target_url, status_code=303)
    _set_auth_cookie(response, access, req)
    response.delete_cookie("oauth_state", path="/")
    return response

@router.post("/refresh", response_model=TokenResponse)
def refresh(request: RefreshRequest, req: Request, response: Response, db: Session = Depends(get_db)):
    try:
        payload = decode_token(request.refresh_token)
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid refresh token")
        user_id = int(payload.get("sub"))
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    token_hash = hashlib.sha256(request.refresh_token.encode()).hexdigest()
    rt = db.query(RefreshToken).filter(RefreshToken.token_hash == token_hash, RefreshToken.revoked == False).first()
    if not rt:
        raise HTTPException(status_code=401, detail="Refresh token not recognized")

    access = create_access_token({"sub": str(user_id)})
    _set_auth_cookie(response, access, req)
    return TokenResponse(access_token=access, refresh_token=request.refresh_token)

@router.post("/logout")
def logout(response: Response, token: RefreshRequest = None, db: Session = Depends(get_db)):
    if token and token.refresh_token:
        token_hash = hashlib.sha256(token.refresh_token.encode()).hexdigest()
        rt = db.query(RefreshToken).filter(RefreshToken.token_hash == token_hash).first()
        if rt:
            rt.revoked = True
            db.commit()
    response.delete_cookie("access_token", path="/")
    return {"detail": "Logged out"}

@router.get("/logout")
def logout_redirect(response: Response):
    """GET logout endpoint for clean redirect back to /login."""
    res = RedirectResponse(url="/login?msg=You%20have%20been%20logged%20out.", status_code=303)
    res.delete_cookie("access_token", path="/")
    return res
