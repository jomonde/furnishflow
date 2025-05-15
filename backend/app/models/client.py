from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ClientBase(BaseModel):
    first_name: str
    last_name: str
    email: str
    phone: str
    notes: Optional[str] = None

class ClientCreate(ClientBase):
    pass

class Client(ClientBase):
    id: str
    created_at: datetime
    updated_at: datetime
    lifetime_spend: float = 0.0
    last_contact: Optional[datetime] = None

    class Config:
        orm_mode = True
