import os
import unittest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient

# Ensure test env
os.environ["SECRET_KEY"] = "test-secret-key-google-auth-2026"
os.environ["GOOGLE_CLIENT_ID"] = "test-google-client-id.apps.googleusercontent.com"
os.environ["GOOGLE_CLIENT_SECRET"] = "test-google-client-secret"
os.environ["GOOGLE_REDIRECT_URI"] = "http://localhost:5000/api/auth/google/callback"

from app.main import app
from app.models.database import engine, Base, SessionLocal, init_db
from app.models.user import User

client = TestClient(app, follow_redirects=False)

class TestGoogleAuthAndSession(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        init_db()

    def setUp(self):
        self.db = SessionLocal()
        # Clean up test users
        self.db.query(User).filter(User.email.in_([
            "tester1@gmail.com",
            "tester2@gmail.com",
            "nongmail@yahoo.com",
            "newfarmer@gmail.com",
            "existing@gmail.com"
        ])).delete()
        self.db.commit()

    def tearDown(self):
        self.db.close()

    def test_01_login_page_renders_continue_with_google(self):
        """Verify login page renders with 'Continue with Google' button."""
        res = client.get("/login")
        self.assertEqual(res.status_code, 200)
        self.assertIn("Continue with Google", res.text)
        self.assertIn("@gmail.com", res.text)
        self.assertIn("btn-google-login", res.text)

    def test_02_unauthenticated_dashboard_redirects_to_login(self):
        """Verify direct access to / while unauthenticated redirects to /login?next=/."""
        res = client.get("/")
        self.assertEqual(res.status_code, 303)
        self.assertEqual(res.headers["location"], "/login?next=/")

    def test_03_unauthenticated_api_me_returns_401(self):
        """Verify /api/auth/me returns 401 when not authenticated."""
        res = client.get("/api/auth/me")
        self.assertEqual(res.status_code, 401)

    def test_04_email_register_and_login_sets_httponly_cookie(self):
        """Test standard email/password registration and login sets HttpOnly cookie."""
        # 1. Register
        reg_res = client.post("/api/auth/register", json={
            "email": "tester1@gmail.com",
            "password": "Password123!",
            "name": "Test Farmer"
        })
        self.assertEqual(reg_res.status_code, 201)
        self.assertIn("access_token", reg_res.cookies)

        # 2. Login
        login_res = client.post("/api/auth/login", json={
            "email": "tester1@gmail.com",
            "password": "Password123!"
        })
        self.assertEqual(login_res.status_code, 200)
        self.assertIn("access_token", login_res.cookies)

        # 3. Access protected dashboard with cookie
        token = login_res.cookies["access_token"]
        dash_res = client.get("/", cookies={"access_token": token})
        self.assertEqual(dash_res.status_code, 200)

        # 4. Access /api/auth/me
        me_res = client.get("/api/auth/me", cookies={"access_token": token})
        self.assertEqual(me_res.status_code, 200)
        data = me_res.json()
        self.assertEqual(data["email"], "tester1@gmail.com")
        self.assertEqual(data["name"], "Test Farmer")

    def test_05_logout_clears_session_cookie(self):
        """Verify /logout clears access_token cookie and redirects to /login."""
        # Login first
        login_res = client.post("/api/auth/register", json={
            "email": "tester2@gmail.com",
            "password": "Password123!",
            "name": "Logout Farmer"
        })
        token = login_res.cookies["access_token"]

        # Call GET /logout
        logout_res = client.get("/logout", cookies={"access_token": token})
        self.assertEqual(logout_res.status_code, 303)
        self.assertIn("/login", logout_res.headers["location"])
        # Cookie deletion is set in Set-Cookie header
        set_cookie = logout_res.headers.get("set-cookie", "")
        self.assertIn("access_token=", set_cookie)

    def test_06_google_auth_url_contains_pkce_and_state(self):
        """Verify /api/auth/google/url returns OAuth URL with PKCE S256 challenge and openid scopes."""
        res = client.get("/api/auth/google/url")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        url = data["url"]
        self.assertIn("https://accounts.google.com/o/oauth2/v2/auth", url)
        self.assertIn("scope=openid+email+profile", url)
        self.assertIn("code_challenge_method=S256", url)
        self.assertIn("code_challenge=", url)
        self.assertIn("response_type=code", url)
        self.assertIn("oauth_state", res.cookies)

    def test_07_google_callback_cancelled_consent(self):
        """Verify cancelled consent returns friendly error without crash."""
        res = client.get("/api/auth/google/callback?error=access_denied")
        self.assertEqual(res.status_code, 303)
        self.assertIn("/login?error=", res.headers["location"])
        self.assertIn("cancelled", res.headers["location"].lower())

    def test_08_google_callback_state_mismatch_rejected(self):
        """Verify state mismatch fails safely (CSRF protection)."""
        res = client.get("/api/auth/google/callback?code=mock_code&state=forged_state")
        self.assertEqual(res.status_code, 303)
        self.assertIn("/login?error=", res.headers["location"])

    @patch("requests.post")
    @patch("google.oauth2.id_token.verify_oauth2_token")
    def test_09_google_callback_rejects_non_gmail_account(self, mock_verify, mock_post):
        """Verify non-Gmail accounts (e.g. @yahoo.com) are rejected with exact error message."""
        # 1. Initiate OAuth to get valid state cookie
        url_res = client.get("/api/auth/google/url")
        state = url_res.json()["state"]
        cookie = url_res.cookies["oauth_state"]

        # 2. Mock token exchange
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.headers = {"Content-Type": "application/json"}
        mock_resp.json.return_value = {"id_token": "mock_id_token", "access_token": "mock_at"}
        mock_post.return_value = mock_resp

        # 3. Mock Google ID token verification with non-Gmail email
        mock_verify.return_value = {
            "iss": "https://accounts.google.com",
            "aud": os.environ["GOOGLE_CLIENT_ID"],
            "sub": "google-sub-non-gmail",
            "email": "nongmail@yahoo.com",
            "email_verified": True,
            "name": "Yahoo User"
        }

        # 4. Call callback
        cb_res = client.get(
            f"/api/auth/google/callback?code=mock_valid_code&state={state}",
            cookies={"oauth_state": cookie}
        )
        self.assertEqual(cb_res.status_code, 303)
        location = cb_res.headers["location"]
        self.assertIn("Please+sign+in+with+a+Gmail+account.", location)

    @patch("requests.post")
    @patch("google.oauth2.id_token.verify_oauth2_token")
    def test_10_google_callback_new_gmail_user_created(self, mock_verify, mock_post):
        """Verify first login with Gmail creates user with name, email, avatar, google_sub."""
        # 1. Initiate OAuth
        url_res = client.get("/api/auth/google/url")
        state = url_res.json()["state"]
        cookie = url_res.cookies["oauth_state"]

        # 2. Mock token exchange
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.headers = {"Content-Type": "application/json"}
        mock_resp.json.return_value = {"id_token": "mock_id_token", "access_token": "mock_at"}
        mock_post.return_value = mock_resp

        # 3. Mock ID token verification
        mock_verify.return_value = {
            "iss": "https://accounts.google.com",
            "aud": os.environ["GOOGLE_CLIENT_ID"],
            "sub": "google-sub-998877",
            "email": "newfarmer@gmail.com",
            "email_verified": True,
            "name": "Ramesh Kumar",
            "picture": "https://lh3.googleusercontent.com/avatar/sample.png"
        }

        # 4. Callback
        cb_res = client.get(
            f"/api/auth/google/callback?code=mock_code_123&state={state}",
            cookies={"oauth_state": cookie}
        )
        self.assertEqual(cb_res.status_code, 303)
        self.assertEqual(cb_res.headers["location"], "/")
        self.assertIn("access_token", cb_res.cookies)

        # 5. Check database
        db_user = self.db.query(User).filter(User.google_sub == "google-sub-998877").first()
        self.assertIsNotNone(db_user)
        self.assertEqual(db_user.email, "newfarmer@gmail.com")
        self.assertEqual(db_user.name, "Ramesh Kumar")
        self.assertEqual(db_user.avatar, "https://lh3.googleusercontent.com/avatar/sample.png")

    @patch("requests.post")
    @patch("google.oauth2.id_token.verify_oauth2_token")
    def test_11_google_callback_links_existing_email_user(self, mock_verify, mock_post):
        """Verify logging in with Google links google_sub to existing user with same email."""
        # 1. Create existing user via email/password
        client.post("/api/auth/register", json={
            "email": "existing@gmail.com",
            "password": "Password123!",
            "name": "Existing Farmer"
        })

        # 2. Initiate OAuth
        url_res = client.get("/api/auth/google/url")
        state = url_res.json()["state"]
        cookie = url_res.cookies["oauth_state"]

        # 3. Mock Google
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.headers = {"Content-Type": "application/json"}
        mock_resp.json.return_value = {"id_token": "mock_id_token", "access_token": "mock_at"}
        mock_post.return_value = mock_resp

        mock_verify.return_value = {
            "iss": "https://accounts.google.com",
            "aud": os.environ["GOOGLE_CLIENT_ID"],
            "sub": "google-sub-linked-4433",
            "email": "existing@gmail.com",
            "email_verified": True,
            "name": "Existing Farmer",
            "picture": "https://lh3.googleusercontent.com/avatar/linked.png"
        }

        # 4. Callback
        cb_res = client.get(
            f"/api/auth/google/callback?code=mock_code_456&state={state}",
            cookies={"oauth_state": cookie}
        )
        self.assertEqual(cb_res.status_code, 303)
        self.assertEqual(cb_res.headers["location"], "/")

        # 5. Verify linked in DB
        db_user = self.db.query(User).filter(User.email == "existing@gmail.com").first()
        self.assertIsNotNone(db_user)
        self.assertEqual(db_user.google_sub, "google-sub-linked-4433")
        self.assertEqual(db_user.avatar, "https://lh3.googleusercontent.com/avatar/linked.png")

if __name__ == "__main__":
    unittest.main()
