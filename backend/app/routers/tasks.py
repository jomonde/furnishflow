from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional, Dict
from datetime import datetime, timedelta
from pydantic import BaseModel, constr, validator
from ..services.supabase_service import supabase_service
from ..services.ai.task_engine import TaskEngine
from ..utils.auth import get_current_user
import os

router = APIRouter()

class TaskBase(BaseModel):
    client_id: str
    title: str
    description: str
    due_date: datetime
    status: constr(regex='^(pending|completed|overdue|cancelled)$')
    priority: constr(regex='^(low|medium|high|urgent)$')
    type: constr(regex='^(manual|ai_generated|followup|maintenance)$') = 'manual'
    category: Optional[str] = None  # e.g., 'design', 'sales', 'delivery'
    assigned_to: Optional[str] = None

    @validator('due_date')
    def validate_due_date(cls, v):
        if v < datetime.now() - timedelta(days=365):
            raise ValueError('Due date cannot be more than a year in the past')
        if v > datetime.now() + timedelta(days=365):
            raise ValueError('Due date cannot be more than a year in the future')
        return v

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    status: Optional[constr(regex='^(pending|completed|overdue|cancelled)$')] = None
    priority: Optional[constr(regex='^(low|medium|high|urgent)$')] = None
    category: Optional[str] = None
    assigned_to: Optional[str] = None

class Task(TaskBase):
    id: str
    created_at: datetime
    updated_at: datetime
    created_by: str

    class Config:
        orm_mode = True

class TaskAnalytics(BaseModel):
    total_tasks: int
    overdue_tasks: int
    completion_rate: float
    tasks_by_status: Dict[str, int]
    tasks_by_priority: Dict[str, int]
    tasks_by_category: Dict[str, int]
    average_completion_time: Optional[float]  # in days

class TaskVolumeByClient(BaseModel):
    client_id: str
    client_name: str
    total_tasks: int
    completed_tasks: int
    overdue_tasks: int
    completion_rate: float

async def get_task_engine():
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="OpenAI API key not configured")
    return TaskEngine(api_key)

@router.get('/tasks', response_model=List[Task])
async def get_tasks(
    client_id: Optional[str] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    category: Optional[str] = None,
    assigned_to: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    current_user: Dict = Depends(get_current_user)
):
    """Get all tasks with optional filtering"""
    try:
        tasks = await supabase_service.get_tasks(
            client_id=client_id,
            status=status,
            priority=priority,
            category=category,
            assigned_to=assigned_to,
            start_date=start_date,
            end_date=end_date
        )
        return tasks
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get('/tasks/{task_id}', response_model=Task)
async def get_task(
    task_id: str,
    current_user: Dict = Depends(get_current_user)
):
    """Get a specific task by ID"""
    try:
        task = await supabase_service.get_task_by_id(task_id)
        if not task:
            raise HTTPException(status_code=404, detail='Task not found')
        return task
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post('/tasks', response_model=Task)
async def create_task(
    task: TaskCreate,
    current_user: Dict = Depends(get_current_user)
):
    """Create a new task"""
    try:
        # Validate client exists
        client = await supabase_service.get_client_by_id(task.client_id)
        if not client:
            raise HTTPException(status_code=404, detail='Client not found')
        
        # Add creator info
        task_data = task.dict()
        task_data['created_by'] = current_user['id']
        
        new_task = await supabase_service.create_task(task_data)
        return new_task
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put('/tasks/{task_id}', response_model=Task)
async def update_task(
    task_id: str,
    task: TaskUpdate,
    current_user: Dict = Depends(get_current_user)
):
    """Update a task"""
    try:
        # Check if task exists
        existing_task = await supabase_service.get_task_by_id(task_id)
        if not existing_task:
            raise HTTPException(status_code=404, detail='Task not found')
        
        updated_task = await supabase_service.update_task(
            task_id,
            task.dict(exclude_unset=True)
        )
        return updated_task
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete('/tasks/{task_id}')
async def delete_task(
    task_id: str,
    current_user: Dict = Depends(get_current_user)
):
    """Delete a task"""
    try:
        # Check if task exists
        existing_task = await supabase_service.get_task_by_id(task_id)
        if not existing_task:
            raise HTTPException(status_code=404, detail='Task not found')
        
        success = await supabase_service.delete_task(task_id)
        if not success:
            raise HTTPException(
                status_code=500,
                detail='Failed to delete task'
            )
        return {'message': 'Task deleted successfully'}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get('/tasks/analytics/overview', response_model=TaskAnalytics)
async def get_task_analytics(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    current_user: Dict = Depends(get_current_user)
):
    """Get task analytics overview"""
    try:
        analytics = await supabase_service.get_task_analytics(
            start_date=start_date,
            end_date=end_date
        )
        return analytics
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get('/tasks/analytics/by-client', response_model=List[TaskVolumeByClient])
async def get_task_volume_by_client(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    current_user: Dict = Depends(get_current_user)
):
    """Get task volume analytics grouped by client"""
    try:
        analytics = await supabase_service.get_task_volume_by_client(
            start_date=start_date,
            end_date=end_date
        )
        return analytics
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get('/tasks/overdue', response_model=List[Task])
async def get_overdue_tasks(
    priority: Optional[str] = None,
    assigned_to: Optional[str] = None,
    current_user: Dict = Depends(get_current_user)
):
    """Get all overdue tasks with optional filtering"""
    try:
        tasks = await supabase_service.get_overdue_tasks(
            priority=priority,
            assigned_to=assigned_to
        )
        return tasks
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post('/tasks/generate/{client_id}', response_model=List[Task])
async def generate_tasks(
    client_id: str,
    current_user: Dict = Depends(get_current_user)
):
    """Generate AI-suggested tasks for a client"""
    try:
        # Get client data and context
        client = await supabase_service.get_client_by_id(client_id)
        if not client:
            raise HTTPException(status_code=404, detail='Client not found')
            
        # Get additional context
        sales = await supabase_service.get_client_sales(client_id)
        notes = await supabase_service.get_client_notes(client_id)
        sketches = await supabase_service.get_client_sketches(client_id)
        
        # Combine context for AI
        context = {
            **client,
            'recent_sales': sales[-3:] if sales else [],  # Last 3 sales
            'recent_notes': notes[-3:] if notes else [],  # Last 3 notes
            'recent_sketches': sketches[-3:] if sketches else []  # Last 3 sketches
        }
        
        # Get task engine and generate suggestions
        task_engine = await get_task_engine()
        suggested_tasks = await task_engine.generate_follow_up_tasks(context)
        
        # Save generated tasks
        created_tasks = []
        for task in suggested_tasks:
            task_data = {
                'client_id': client_id,
                'title': task['title'],
                'description': task['description'],
                'due_date': task.get('due_date', datetime.now() + timedelta(days=7)),
                'status': 'pending',
                'priority': task.get('priority', 'medium'),
                'type': 'ai_generated',
                'category': task.get('category', 'followup'),
                'created_by': current_user['id'],
                'assigned_to': task.get('assigned_to', current_user['id'])
            }
            created_task = await supabase_service.create_task(task_data)
            created_tasks.append(created_task)
        
        return created_tasks
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
