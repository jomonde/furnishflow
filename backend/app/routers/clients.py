from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional, Dict
from pydantic import BaseModel, EmailStr
from datetime import datetime
from ..services.supabase_service import supabase_service
from ..services.ai.message_engine import MessageEngine
from ..services.ai.task_engine import TaskEngine
from ..utils.auth import get_current_user
import os

router = APIRouter()

# Dependency to get AI services
async def get_ai_services():
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="OpenAI API key not configured")
    return {
        "message_engine": MessageEngine(api_key),
        "task_engine": TaskEngine(api_key)
    }

class ClientBase(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: Optional[str] = None
    status: str = 'active'

class ClientCreate(ClientBase):
    pass

class ClientUpdate(ClientBase):
    pass

class Client(ClientBase):
    id: str
    lifetime_spend: float = 0.0
    last_contact: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class ClientAnalytics(BaseModel):
    total_spend: float
    task_completion_rate: float
    interaction_frequency: int
    last_interaction: Optional[datetime]

@router.get('/clients', response_model=List[Client])
async def get_clients(
    search: Optional[str] = None,
    current_user: Dict = Depends(get_current_user)
):
    try:
        clients = await supabase_service.get_clients(search)
        return clients
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get('/clients/{client_id}', response_model=Client)
async def get_client(
    client_id: str,
    current_user: Dict = Depends(get_current_user)
):
    try:
        client = await supabase_service.get_client_by_id(client_id)
        if not client:
            raise HTTPException(status_code=404, detail='Client not found')
        return client
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post('/clients', response_model=Client)
async def create_client(
    client: ClientCreate,
    current_user: Dict = Depends(get_current_user)
):
    try:
        # Check if email already exists
        existing = await supabase_service.get_clients(client.email)
        if existing:
            raise HTTPException(
                status_code=400,
                detail='A client with this email already exists'
            )
        
        new_client = await supabase_service.create_client(client.dict())
        return new_client
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put('/clients/{client_id}', response_model=Client)
async def update_client(
    client_id: str,
    client: ClientUpdate,
    current_user: Dict = Depends(get_current_user)
):
    try:
        # Check if client exists
        existing = await supabase_service.get_client_by_id(client_id)
        if not existing:
            raise HTTPException(status_code=404, detail='Client not found')
        
        # Check if updating email and if it conflicts
        if client.email != existing['email']:
            email_check = await supabase_service.get_clients(client.email)
            if email_check:
                raise HTTPException(
                    status_code=400,
                    detail='A client with this email already exists'
                )
        
        updated_client = await supabase_service.update_client(
            client_id,
            client.dict(exclude_unset=True)
        )
        return updated_client
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete('/clients/{client_id}')
async def delete_client(
    client_id: str,
    current_user: Dict = Depends(get_current_user)
):
    try:
        # Check if client exists
        existing = await supabase_service.get_client_by_id(client_id)
        if not existing:
            raise HTTPException(status_code=404, detail='Client not found')
        
        success = await supabase_service.delete_client(client_id)
        if not success:
            raise HTTPException(
                status_code=500,
                detail='Failed to delete client'
            )
        return {'message': 'Client deleted successfully'}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get('/clients/{client_id}/analytics', response_model=ClientAnalytics)
async def get_client_analytics(
    client_id: str,
    current_user: Dict = Depends(get_current_user)
):
    try:
        analytics = await supabase_service.get_client_analytics(client_id)
        if not analytics:
            raise HTTPException(status_code=404, detail='Client analytics not found')
        return analytics
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post('/{client_id}/generate-followup')
async def generate_followup(
    client_id: str,
    current_user: Dict = Depends(get_current_user),
    ai_services: dict = Depends(get_ai_services)
):
    """Generate a follow-up message for a client"""
    try:
        client = await supabase_service.get_client_by_id(client_id)
        if not client:
            raise HTTPException(status_code=404, detail='Client not found')
        
        message = await ai_services["message_engine"].generate_follow_up(client)
        return {"message": message}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post('/{client_id}/analyze')
async def analyze_client(
    client_id: str,
    current_user: Dict = Depends(get_current_user),
    ai_services: dict = Depends(get_ai_services)
):
    """Generate AI insights for a client"""
    try:
        # Get client and their history from Supabase
        client = await supabase_service.get_client_by_id(client_id)
        if not client:
            raise HTTPException(status_code=404, detail='Client not found')
            
        # Get client history including purchases and interactions
        history = await supabase_service.get_client_history(client_id)
        
        # Combine client data with history for analysis
        client_profile = {
            **client,
            **history
        }
        
        analysis = await ai_services["message_engine"].analyze_client_profile(client_profile)
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
