from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional, Dict
from datetime import datetime
from pydantic import BaseModel, constr, validator, HttpUrl
from ..services.supabase_service import supabase_service
from ..utils.auth import get_current_user

router = APIRouter()

class SketchBase(BaseModel):
    client_id: str
    title: str
    description: Optional[str] = None
    file_path: str  # Path to stored sketch file
    room_type: constr(regex='^(living_room|bedroom|dining_room|kitchen|bathroom|office|outdoor|other)$')
    style_tags: Optional[List[str]] = None  # e.g., modern, traditional, minimalist
    color_scheme: Optional[List[str]] = None  # e.g., warm, cool, neutral
    furniture_items: Optional[List[str]] = None  # Referenced furniture pieces
    analysis: Optional[Dict[str, any]] = None  # AI-generated analysis
    visibility: constr(regex='^(public|private|team)$') = 'public'
    status: constr(regex='^(draft|review|approved|archived)$') = 'draft'
    dimensions: Optional[Dict[str, float]] = None  # Room dimensions if available
    budget_range: Optional[Dict[str, float]] = None  # Min/max budget for the design

    @validator('title')
    def validate_title(cls, v):
        if not v.strip():
            raise ValueError('Title cannot be empty')
        if len(v) > 200:
            raise ValueError('Title cannot exceed 200 characters')
        return v.strip()

    @validator('description')
    def validate_description(cls, v):
        if v and len(v) > 2000:
            raise ValueError('Description cannot exceed 2000 characters')
        return v.strip() if v else None

    @validator('style_tags', 'furniture_items')
    def validate_tags(cls, v):
        if v:
            if len(v) > 15:
                raise ValueError('Cannot have more than 15 tags')
            if not all(isinstance(tag, str) and tag.strip() for tag in v):
                raise ValueError('All tags must be non-empty strings')
            return [tag.strip().lower() for tag in v]
        return v

class SketchCreate(SketchBase):
    pass

class SketchUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    room_type: Optional[constr(regex='^(living_room|bedroom|dining_room|kitchen|bathroom|office|outdoor|other)$')] = None
    style_tags: Optional[List[str]] = None
    color_scheme: Optional[List[str]] = None
    furniture_items: Optional[List[str]] = None
    analysis: Optional[Dict[str, any]] = None
    visibility: Optional[constr(regex='^(public|private|team)$')] = None
    status: Optional[constr(regex='^(draft|review|approved|archived)$')] = None
    dimensions: Optional[Dict[str, float]] = None
    budget_range: Optional[Dict[str, float]] = None

class Sketch(SketchBase):
    id: str
    created_at: datetime
    updated_at: datetime
    created_by: str
    last_edited_by: Optional[str] = None
    preview_url: Optional[HttpUrl] = None  # Generated thumbnail URL
    version: int = 1  # For tracking revisions

    class Config:
        orm_mode = True

class SketchAnalytics(BaseModel):
    total_sketches: int
    sketches_by_room: Dict[str, int]
    sketches_by_status: Dict[str, int]
    popular_styles: List[Dict[str, int]]
    popular_furniture: List[Dict[str, int]]
    average_sketches_per_client: float
    most_active_creators: List[Dict[str, any]]
    average_budget_range: Optional[Dict[str, float]]

class ClientSketchInsights(BaseModel):
    client_id: str
    client_name: str
    total_sketches: int
    preferred_styles: List[str]
    common_rooms: List[str]
    budget_preferences: Dict[str, float]
    design_progression: List[Dict[str, any]]  # Timeline of design evolution
    pending_approvals: int

@router.get('/sketches', response_model=List[Sketch])
async def get_sketches(
    client_id: Optional[str] = None,
    room_type: Optional[str] = None,
    status: Optional[str] = None,
    style_tags: Optional[List[str]] = None,
    created_by: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    limit: Optional[int] = None,
    current_user: Dict = Depends(get_current_user)
):
    """Get all sketches with optional filtering"""
    try:
        sketches = await supabase_service.get_sketches(
            client_id=client_id,
            room_type=room_type,
            status=status,
            style_tags=style_tags,
            created_by=created_by,
            start_date=start_date,
            end_date=end_date,
            limit=limit
        )
        return sketches
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get('/sketches/{sketch_id}', response_model=Sketch)
async def get_sketch(
    sketch_id: str,
    current_user: Dict = Depends(get_current_user)
):
    """Get a specific sketch by ID"""
    try:
        sketch = await supabase_service.get_sketch_by_id(sketch_id)
        if not sketch:
            raise HTTPException(status_code=404, detail='Sketch not found')
        return sketch
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post('/sketches', response_model=Sketch)
async def create_sketch(
    sketch: SketchCreate,
    current_user: Dict = Depends(get_current_user)
):
    """Create a new sketch"""
    try:
        # Validate client exists
        client = await supabase_service.get_client_by_id(sketch.client_id)
        if not client:
            raise HTTPException(status_code=404, detail='Client not found')
        
        # Add creator info
        sketch_data = sketch.dict()
        sketch_data['created_by'] = current_user['id']
        
        new_sketch = await supabase_service.create_sketch(sketch_data)
        return new_sketch
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put('/sketches/{sketch_id}', response_model=Sketch)
async def update_sketch(
    sketch_id: str,
    sketch: SketchUpdate,
    current_user: Dict = Depends(get_current_user)
):
    """Update a sketch"""
    try:
        # Check if sketch exists
        existing_sketch = await supabase_service.get_sketch_by_id(sketch_id)
        if not existing_sketch:
            raise HTTPException(status_code=404, detail='Sketch not found')
        
        # Add editor info and increment version
        sketch_data = sketch.dict(exclude_unset=True)
        sketch_data['last_edited_by'] = current_user['id']
        sketch_data['version'] = existing_sketch['version'] + 1
        
        updated_sketch = await supabase_service.update_sketch(
            sketch_id,
            sketch_data
        )
        return updated_sketch
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete('/sketches/{sketch_id}')
async def delete_sketch(
    sketch_id: str,
    current_user: Dict = Depends(get_current_user)
):
    """Delete a sketch"""
    try:
        # Check if sketch exists
        existing_sketch = await supabase_service.get_sketch_by_id(sketch_id)
        if not existing_sketch:
            raise HTTPException(status_code=404, detail='Sketch not found')
        
        success = await supabase_service.delete_sketch(sketch_id)
        if not success:
            raise HTTPException(
                status_code=500,
                detail='Failed to delete sketch'
            )
        return {'message': 'Sketch deleted successfully'}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get('/sketches/analytics/overview', response_model=SketchAnalytics)
async def get_sketch_analytics(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    current_user: Dict = Depends(get_current_user)
):
    """Get sketch analytics overview"""
    try:
        analytics = await supabase_service.get_sketch_analytics(
            start_date=start_date,
            end_date=end_date
        )
        return analytics
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get('/sketches/client/{client_id}/insights', response_model=ClientSketchInsights)
async def get_client_sketch_insights(
    client_id: str,
    current_user: Dict = Depends(get_current_user)
):
    """Get detailed insights from a client's sketches"""
    try:
        # Validate client exists
        client = await supabase_service.get_client_by_id(client_id)
        if not client:
            raise HTTPException(status_code=404, detail='Client not found')
            
        insights = await supabase_service.get_client_sketch_insights(client_id)
        return insights
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post('/sketches/{sketch_id}/analyze')
async def analyze_sketch(
    sketch_id: str,
    current_user: Dict = Depends(get_current_user)
):
    """Generate AI analysis for a sketch"""
    try:
        # Get sketch and validate
        sketch = await supabase_service.get_sketch_by_id(sketch_id)
        if not sketch:
            raise HTTPException(status_code=404, detail='Sketch not found')
            
        # Get client context
        client = await supabase_service.get_client_by_id(sketch['client_id'])
        if not client:
            raise HTTPException(status_code=404, detail='Client not found')
            
        # Get related sketches for context
        related_sketches = await supabase_service.get_sketches(
            client_id=sketch['client_id'],
            room_type=sketch['room_type'],
            limit=5
        )
        
        # Combine context for analysis
        context = {
            'sketch': sketch,
            'client': client,
            'related_sketches': related_sketches
        }
        
        # Generate analysis
        analysis = await supabase_service.analyze_sketch(sketch_id, context)
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post('/sketches/{sketch_id}/approve')
async def approve_sketch(
    sketch_id: str,
    current_user: Dict = Depends(get_current_user)
):
    """Approve a sketch, moving it to approved status"""
    try:
        # Get sketch and validate
        sketch = await supabase_service.get_sketch_by_id(sketch_id)
        if not sketch:
            raise HTTPException(status_code=404, detail='Sketch not found')
            
        if sketch['status'] != 'review':
            raise HTTPException(
                status_code=400,
                detail='Only sketches in review status can be approved'
            )
        
        # Update status and add approver
        update_data = {
            'status': 'approved',
            'approved_by': current_user['id'],
            'approved_at': datetime.now(),
            'version': sketch['version'] + 1
        }
        
        updated_sketch = await supabase_service.update_sketch(
            sketch_id,
            update_data
        )
        return updated_sketch
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
