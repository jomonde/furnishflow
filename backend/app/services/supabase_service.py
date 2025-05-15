from typing import Dict, List, Optional, Any
from supabase import create_client, Client
import os
from dotenv import load_dotenv

load_dotenv()

class SupabaseService:
    def __init__(self):
        self.supabase: Client = create_client(
            os.getenv("SUPABASE_URL", ""),
            os.getenv("SUPABASE_KEY", "")
        )

    # Client Operations
    async def get_clients(self, search_term: Optional[str] = None) -> List[Dict]:
        query = self.supabase.table("clients").select("*")
        if search_term:
            query = query.or_(
                f"first_name.ilike.%{search_term}%,"
                f"last_name.ilike.%{search_term}%,"
                f"email.ilike.%{search_term}%"
            )
        response = query.execute()
        return response.data

    async def get_client_by_id(self, client_id: str) -> Optional[Dict]:
        response = self.supabase.table("clients").select("*").eq("id", client_id).single().execute()
        return response.data

    async def create_client(self, client_data: Dict) -> Dict:
        response = self.supabase.table("clients").insert(client_data).execute()
        return response.data[0]

    async def update_client(self, client_id: str, client_data: Dict) -> Dict:
        response = self.supabase.table("clients").update(client_data).eq("id", client_id).execute()
        return response.data[0]

    async def delete_client(self, client_id: str) -> bool:
        response = self.supabase.table("clients").delete().eq("id", client_id).execute()
        return len(response.data) > 0

    # Sales Operations
    async def get_client_sales(self, client_id: str) -> List[Dict]:
        response = self.supabase.table("sales").select(
            "*, sale_items(*)"
        ).eq("client_id", client_id).execute()
        return response.data

    async def create_sale(self, sale_data: Dict, items: List[Dict]) -> Dict:
        # Create sale first
        sale_response = self.supabase.table("sales").insert(sale_data).execute()
        sale_id = sale_response.data[0]["id"]
        
        # Add items with the sale_id
        for item in items:
            item["sale_id"] = sale_id
        items_response = self.supabase.table("sale_items").insert(items).execute()
        
        # Return combined data
        return {
            "sale": sale_response.data[0],
            "items": items_response.data
        }

    # Tasks Operations
    async def get_client_tasks(self, client_id: str, status: Optional[str] = None) -> List[Dict]:
        query = self.supabase.table("tasks").select("*").eq("client_id", client_id)
        if status:
            query = query.eq("status", status)
        response = query.order("due_date", desc=False).execute()
        return response.data

    async def create_task(self, task_data: Dict) -> Dict:
        response = self.supabase.table("tasks").insert(task_data).execute()
        return response.data[0]

    async def update_task_status(self, task_id: str, status: str) -> Dict:
        response = self.supabase.table("tasks").update(
            {"status": status, "updated_at": "NOW()"}).eq("id", task_id).execute()
        return response.data[0]

    # Notes Operations
    async def get_client_notes(self, client_id: str, type: Optional[str] = None) -> List[Dict]:
        query = self.supabase.table("notes").select("*").eq("client_id", client_id)
        if type:
            query = query.eq("type", type)
        response = query.order("created_at", desc=True).execute()
        return response.data

    async def create_note(self, note_data: Dict) -> Dict:
        response = self.supabase.table("notes").insert(note_data).execute()
        return response.data[0]

    # Sketches Operations
    async def get_client_sketches(self, client_id: str) -> List[Dict]:
        response = self.supabase.table("sketches").select("*").eq("client_id", client_id).execute()
        return response.data

    async def create_sketch(self, sketch_data: Dict) -> Dict:
        response = self.supabase.table("sketches").insert(sketch_data).execute()
        return response.data[0]

    # Analytics Operations
    async def get_client_analytics(self, client_id: str) -> Dict[str, Any]:
        """Get comprehensive analytics for a client"""
        # Get total spend
        spend_query = self.supabase.table("sales").select(
            "amount"
        ).eq("client_id", client_id).eq("status", "closed").execute()
        
        total_spend = sum(sale["amount"] for sale in spend_query.data)
        
        # Get task completion rate
        tasks_query = self.supabase.table("tasks").select(
            "status"
        ).eq("client_id", client_id).execute()
        
        total_tasks = len(tasks_query.data)
        completed_tasks = len([t for t in tasks_query.data if t["status"] == "completed"])
        
        # Get interaction frequency (notes + tasks)
        interactions_query = self.supabase.table("notes").select(
            "created_at"
        ).eq("client_id", client_id).execute()
        
        total_interactions = len(interactions_query.data) + total_tasks
        
        return {
            "total_spend": total_spend,
            "task_completion_rate": completed_tasks / total_tasks if total_tasks > 0 else 0,
            "interaction_frequency": total_interactions,
            "last_interaction": interactions_query.data[0]["created_at"] if interactions_query.data else None
        }

supabase_service = SupabaseService()
