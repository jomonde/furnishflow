from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional, Dict
from datetime import datetime
from pydantic import BaseModel, constr, validator
from ..services.supabase_service import supabase_service
from ..utils.auth import get_current_user

router = APIRouter()

class NoteBase(BaseModel):
    client_id: str
    content: str
    type: constr(regex='^(general|followup|meeting|ai_generated|feedback|design|sales)$')
    tags: Optional[List[str]] = None
    sentiment: Optional[str] = None  # positive, negative, neutral
    room_type: Optional[str] = None  # living_room, bedroom, kitchen, etc.
    follow_up_date: Optional[datetime] = None
    visibility: constr(regex='^(public|private|team)$') = 'public'

    @validator('content')
    def validate_content(cls, v):
        if not v.strip():
            raise ValueError('Content cannot be empty')
        if len(v) > 5000:
            raise ValueError('Content cannot exceed 5000 characters')
        return v

    @validator('tags')
    def validate_tags(cls, v):
        if v:
            if len(v) > 10:
                raise ValueError('Cannot have more than 10 tags')
            if not all(isinstance(tag, str) and tag.strip() for tag in v):
                raise ValueError('All tags must be non-empty strings')
        return v

class NoteCreate(NoteBase):
    pass

class NoteUpdate(BaseModel):
    content: Optional[str] = None
    type: Optional[constr(regex='^(general|followup|meeting|ai_generated|feedback|design|sales)$')] = None
    tags: Optional[List[str]] = None
    sentiment: Optional[str] = None
    room_type: Optional[str] = None
    follow_up_date: Optional[datetime] = None
    visibility: Optional[constr(regex='^(public|private|team)$')] = None

class Note(NoteBase):
    id: str
    created_at: datetime
    updated_at: datetime
    created_by: str
    last_edited_by: Optional[str] = None

    class Config:
        orm_mode = True

class NoteAnalytics(BaseModel):
    total_notes: int
    notes_by_type: Dict[str, int]
    notes_by_room: Dict[str, int]
    notes_by_sentiment: Dict[str, int]
    average_notes_per_client: float
    most_active_creators: List[Dict[str, any]]
    popular_tags: List[Dict[str, int]]

class ClientNoteInsights(BaseModel):
    client_id: str
    client_name: str
    total_notes: int
    sentiment_distribution: Dict[str, float]
    common_topics: List[str]
    recent_interactions: List[Dict[str, any]]
    follow_up_needed: bool

@router.get('/notes', response_model=List[Note])
async def get_notes(
    client_id: Optional[str] = None,
    type: Optional[str] = None,
    room_type: Optional[str] = None,
    sentiment: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    tags: Optional[List[str]] = None,
    limit: Optional[int] = None,
    current_user: Dict = Depends(get_current_user)
):
    """Get all notes with optional filtering"""
    try:
        notes = await supabase_service.get_notes(
            client_id=client_id,
            type=type,
            room_type=room_type,
            sentiment=sentiment,
            start_date=start_date,
            end_date=end_date,
            tags=tags,
            limit=limit
        )
        return notes
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get('/notes/{note_id}', response_model=Note)
async def get_note(
    note_id: str,
    current_user: Dict = Depends(get_current_user)
):
    """Get a specific note by ID"""
    try:
        note = await supabase_service.get_note_by_id(note_id)
        if not note:
            raise HTTPException(status_code=404, detail='Note not found')
        return note
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post('/notes', response_model=Note)
async def create_note(
    note: NoteCreate,
    current_user: Dict = Depends(get_current_user)
):
    """Create a new note"""
    try:
        # Validate client exists
        client = await supabase_service.get_client_by_id(note.client_id)
        if not client:
            raise HTTPException(status_code=404, detail='Client not found')
        
        # Add creator info
        note_data = note.dict()
        note_data['created_by'] = current_user['id']
        
        new_note = await supabase_service.create_note(note_data)
        return new_note
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put('/notes/{note_id}', response_model=Note)
async def update_note(
    note_id: str,
    note: NoteUpdate,
    current_user: Dict = Depends(get_current_user)
):
    """Update a note"""
    try:
        # Check if note exists
        existing_note = await supabase_service.get_note_by_id(note_id)
        if not existing_note:
            raise HTTPException(status_code=404, detail='Note not found')
        
        # Add editor info
        note_data = note.dict(exclude_unset=True)
        note_data['last_edited_by'] = current_user['id']
        
        updated_note = await supabase_service.update_note(
            note_id,
            note_data
        )
        return updated_note
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete('/notes/{note_id}')
async def delete_note(
    note_id: str,
    current_user: Dict = Depends(get_current_user)
):
    """Delete a note"""
    try:
        # Check if note exists
        existing_note = await supabase_service.get_note_by_id(note_id)
        if not existing_note:
            raise HTTPException(status_code=404, detail='Note not found')
        
        success = await supabase_service.delete_note(note_id)
        if not success:
            raise HTTPException(
                status_code=500,
                detail='Failed to delete note'
            )
        return {'message': 'Note deleted successfully'}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get('/notes/analytics/overview', response_model=NoteAnalytics)
async def get_note_analytics(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    current_user: Dict = Depends(get_current_user)
):
    """Get note analytics overview"""
    try:
        analytics = await supabase_service.get_note_analytics(
            start_date=start_date,
            end_date=end_date
        )
        return analytics
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get('/notes/client/{client_id}/insights', response_model=ClientNoteInsights)
async def get_client_note_insights(
    client_id: str,
    current_user: Dict = Depends(get_current_user)
):
    """Get detailed insights from a client's notes"""
    try:
        # Validate client exists
        client = await supabase_service.get_client_by_id(client_id)
        if not client:
            raise HTTPException(status_code=404, detail='Client not found')
            
        insights = await supabase_service.get_client_note_insights(client_id)
        return insights
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post('/notes/bulk', response_model=List[Note])
async def create_bulk_notes(
    notes: List[NoteCreate],
    current_user: Dict = Depends(get_current_user)
):
    """Create multiple notes at once"""
    try:
        created_notes = []
        for note in notes:
            # Validate client exists
            client = await supabase_service.get_client_by_id(note.client_id)
            if not client:
                raise HTTPException(
                    status_code=404,
                    detail=f'Client not found for note: {note.content[:50]}...'
                )
            
            # Add creator info
            note_data = note.dict()
            note_data['created_by'] = current_user['id']
            
            created_note = await supabase_service.create_note(note_data)
            created_notes.append(created_note)
            
        return created_notes
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
