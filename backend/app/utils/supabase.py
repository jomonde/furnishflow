from supabase import create_client
import os
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

class SupabaseClient:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            # Initialize the Supabase client
            supabase_url = os.getenv("SUPABASE_URL")
            supabase_key = os.getenv("SUPABASE_KEY")
            
            if not supabase_url or not supabase_key:
                raise ValueError("Supabase credentials not found in environment variables")
            
            cls._instance.client = create_client(supabase_url, supabase_key)
        return cls._instance

    @classmethod
    def get_client(cls):
        return cls().client

class SupabaseTable:
    def __init__(self, table_name: str):
        self.client = SupabaseClient.get_client()
        self.table = table_name

    async def list(self, query_params: Optional[dict] = None):
        """List all records with optional query parameters"""
        query = self.client.table(self.table).select("*")
        
        if query_params:
            if "filters" in query_params:
                for field, value in query_params["filters"].items():
                    query = query.eq(field, value)
            if "order" in query_params:
                for field, direction in query_params["order"].items():
                    query = query.order(field, desc=(direction.lower() == "desc"))
            if "limit" in query_params:
                query = query.limit(query_params["limit"])
        
        response = query.execute()
        return response.data

    async def get(self, id: str):
        """Get a single record by ID"""
        response = self.client.table(self.table).select("*").eq("id", id).execute()
        return response.data[0] if response.data else None

    async def create(self, data: dict):
        """Create a new record"""
        response = self.client.table(self.table).insert(data).execute()
        return response.data[0] if response.data else None

    async def update(self, id: str, data: dict):
        """Update a record by ID"""
        response = self.client.table(self.table).update(data).eq("id", id).execute()
        return response.data[0] if response.data else None

    async def delete(self, id: str):
        """Delete a record by ID"""
        response = self.client.table(self.table).delete().eq("id", id).execute()
        return response.data[0] if response.data else None

    async def list_by_client(self, client_id: str):
        """List all records for a specific client"""
        response = self.client.table(self.table).select("*").eq("client_id", client_id).execute()
        return response.data
