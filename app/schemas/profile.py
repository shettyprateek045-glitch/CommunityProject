from pydantic import BaseModel, Field
from typing import Optional, List

class UserProfile(BaseModel):
    phone: str
    email: Optional[str] = None
    name: Optional[str] = None
    language: Optional[str] = "en"
    state: Optional[str] = None
    district: Optional[str] = None
    taluk: Optional[str] = None
    village: Optional[str] = None
    experience_years: int = 0
    is_active: bool = True

    class Config:
        orm_mode = True

class FarmBase(BaseModel):
    name: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    taluk: Optional[str] = None
    village: Optional[str] = None
    lat: Optional[float] = None
    lon: Optional[float] = None
    land_acres: Optional[float] = 1.0
    irrigation: Optional[str] = "rainfed"

class FarmCreate(FarmBase):
    pass

class FarmUpdate(FarmBase):
    pass

class FarmOut(FarmBase):
    id: int

    class Config:
        orm_mode = True

class ProfileResponse(BaseModel):
    user: UserProfile
    farms: List[FarmOut] = []

    class Config:
        orm_mode = True
