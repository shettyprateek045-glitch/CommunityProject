# app/schemas/__init__.py
"""Schema package initializer.
Exports the Pydantic models used throughout the project.
"""

# Import the core schema definitions
from . import _schemas as _schemas
# Import profile‑related schemas (farm and user profile)
from . import profile as _profile

# Re‑export models for convenient package imports
WeatherRequest = _schemas.WeatherRequest
WeatherResponse = _schemas.WeatherResponse
IPLocationResponse = _schemas.IPLocationResponse
RecommendRequest = _schemas.RecommendRequest
RecommendResponse = _schemas.RecommendResponse

# Profile models come from the separate `profile` module
ProfileResponse = _profile.ProfileResponse
PhotoCheckResponse = _schemas.PhotoCheckResponse
FarmCreate = _profile.FarmCreate
FarmUpdate = _profile.FarmUpdate
FarmOut = _profile.FarmOut

SoilPhotoResponse = _schemas.SoilPhotoResponse
RotationCheckRequest = _schemas.RotationCheckRequest
RotationCheckResponse = _schemas.RotationCheckResponse
# Add any other models as required
