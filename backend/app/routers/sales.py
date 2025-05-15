from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional, Dict
from datetime import datetime
from pydantic import BaseModel, constr, conint, confloat
from ..services.supabase_service import supabase_service
from ..utils.auth import get_current_user

router = APIRouter()

class SaleItem(BaseModel):
    id: str
    name: str
    quantity: conint(gt=0)  # Must be greater than 0
    price: confloat(gt=0)  # Must be greater than 0
    category: Optional[str] = None

class SaleBase(BaseModel):
    client_id: str
    amount: confloat(gt=0)  # Must be greater than 0
    status: constr(regex='^(pending|completed|cancelled)$')  # Enum-like validation
    items: List[SaleItem]
    notes: Optional[str] = None
    payment_method: Optional[str] = None
    delivery_date: Optional[datetime] = None

class SaleCreate(SaleBase):
    pass

class SaleUpdate(BaseModel):
    amount: Optional[confloat(gt=0)] = None
    status: Optional[constr(regex='^(pending|completed|cancelled)$')] = None
    items: Optional[List[SaleItem]] = None
    notes: Optional[str] = None
    payment_method: Optional[str] = None
    delivery_date: Optional[datetime] = None

class Sale(SaleBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class SaleAnalytics(BaseModel):
    total_revenue: float
    average_order_value: float
    total_orders: int
    popular_items: List[Dict[str, any]]
    sales_by_status: Dict[str, int]

@router.get('/sales', response_model=List[Sale])
async def get_sales(
    client_id: Optional[str] = None,
    status: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    limit: Optional[int] = None,
    current_user: Dict = Depends(get_current_user)
):
    """Get all sales with optional filtering"""
    try:
        sales = await supabase_service.get_sales(
            client_id=client_id,
            status=status,
            start_date=start_date,
            end_date=end_date,
            limit=limit
        )
        return sales
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get('/sales/{sale_id}', response_model=Sale)
async def get_sale(
    sale_id: str,
    current_user: Dict = Depends(get_current_user)
):
    """Get a specific sale by ID"""
    try:
        sale = await supabase_service.get_sale_by_id(sale_id)
        if not sale:
            raise HTTPException(status_code=404, detail='Sale not found')
        return sale
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post('/sales', response_model=Sale)
async def create_sale(
    sale: SaleCreate,
    current_user: Dict = Depends(get_current_user)
):
    """Create a new sale"""
    try:
        # Validate client exists
        client = await supabase_service.get_client_by_id(sale.client_id)
        if not client:
            raise HTTPException(status_code=404, detail='Client not found')
        
        # Calculate total amount from items
        calculated_amount = sum(item.price * item.quantity for item in sale.items)
        if abs(calculated_amount - sale.amount) > 0.01:  # Allow for small float differences
            raise HTTPException(
                status_code=400,
                detail='Sale amount does not match sum of item prices'
            )
        
        new_sale = await supabase_service.create_sale(sale.dict())
        return new_sale
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put('/sales/{sale_id}', response_model=Sale)
async def update_sale(
    sale_id: str,
    sale: SaleUpdate,
    current_user: Dict = Depends(get_current_user)
):
    """Update a sale"""
    try:
        # Check if sale exists
        existing_sale = await supabase_service.get_sale_by_id(sale_id)
        if not existing_sale:
            raise HTTPException(status_code=404, detail='Sale not found')
        
        # If updating items, validate total amount
        if sale.items and sale.amount:
            calculated_amount = sum(item.price * item.quantity for item in sale.items)
            if abs(calculated_amount - sale.amount) > 0.01:
                raise HTTPException(
                    status_code=400,
                    detail='Sale amount does not match sum of item prices'
                )
        
        updated_sale = await supabase_service.update_sale(
            sale_id,
            sale.dict(exclude_unset=True)
        )
        return updated_sale
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete('/sales/{sale_id}')
async def delete_sale(
    sale_id: str,
    current_user: Dict = Depends(get_current_user)
):
    """Delete a sale"""
    try:
        # Check if sale exists
        existing_sale = await supabase_service.get_sale_by_id(sale_id)
        if not existing_sale:
            raise HTTPException(status_code=404, detail='Sale not found')
        
        success = await supabase_service.delete_sale(sale_id)
        if not success:
            raise HTTPException(
                status_code=500,
                detail='Failed to delete sale'
            )
        return {'message': 'Sale deleted successfully'}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get('/sales/client/{client_id}', response_model=List[Sale])
async def get_client_sales(
    client_id: str,
    current_user: Dict = Depends(get_current_user)
):
    """Get all sales for a specific client"""
    try:
        # Validate client exists
        client = await supabase_service.get_client_by_id(client_id)
        if not client:
            raise HTTPException(status_code=404, detail='Client not found')
            
        sales = await supabase_service.get_client_sales(client_id)
        return sales
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get('/sales/analytics/overview', response_model=SaleAnalytics)
async def get_sales_analytics(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    current_user: Dict = Depends(get_current_user)
):
    """Get sales analytics overview"""
    try:
        analytics = await supabase_service.get_sales_analytics(
            start_date=start_date,
            end_date=end_date
        )
        return analytics
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
