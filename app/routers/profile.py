from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..models.database import get_db
from ..models.user import User, Farm
from ..schemas.profile import ProfileResponse, FarmCreate, FarmUpdate, FarmOut
from ..dependencies import get_current_user

router = APIRouter(prefix="/api/profile", tags=["profile"])

@router.get("/me", response_model=ProfileResponse)
def get_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    farms = db.query(Farm).filter(Farm.user_id == current_user.id).all()
    return ProfileResponse(user=current_user, farms=farms)

@router.post("/farms", response_model=FarmOut, status_code=status.HTTP_201_CREATED)
def create_farm(farm: FarmCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    new_farm = Farm(user_id=current_user.id, **farm.dict())
    db.add(new_farm)
    db.commit()
    db.refresh(new_farm)
    return new_farm

@router.put("/farms/{farm_id}", response_model=FarmOut)
def update_farm(farm_id: int, farm: FarmUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    existing = db.query(Farm).filter(Farm.id == farm_id, Farm.user_id == current_user.id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Farm not found")
    for attr, value in farm.dict(exclude_unset=True).items():
        setattr(existing, attr, value)
    db.commit()
    db.refresh(existing)
    return existing

@router.delete("/farms/{farm_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_farm(farm_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    farm = db.query(Farm).filter(Farm.id == farm_id, Farm.user_id == current_user.id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    db.delete(farm)
    db.commit()
    return None
