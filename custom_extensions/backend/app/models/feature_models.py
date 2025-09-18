# custom_extensions/backend/app/models/feature_models.py
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class FeatureDefinition(BaseModel):
    id: Optional[int] = None
    feature_name: str
    display_name: str
    description: Optional[str] = None
    category: Optional[str] = None
    is_active: bool = True
    created_at: Optional[datetime] = None

class UserFeature(BaseModel):
    id: Optional[int] = None
    user_id: str
    feature_name: str
    is_enabled: bool = False
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class UserFeatureWithDetails(BaseModel):
    id: int
    user_id: str
    feature_name: str
    is_enabled: bool
    created_at: datetime
    updated_at: datetime
    display_name: str
    description: Optional[str] = None
    category: Optional[str] = None

class BulkFeatureToggleRequest(BaseModel):
    user_ids: List[str]
    feature_name: str
    is_enabled: bool

class FeatureToggleRequest(BaseModel):
    user_id: str
    feature_name: str
    is_enabled: bool

class UserTypeAssignmentRequest(BaseModel):
    user_ids: List[str]
    user_type: str 