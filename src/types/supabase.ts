export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      clients: {
        Row: {
          address: Json
          budget_max: number | null
          budget_min: number | null
          created_at: string | null
          email: string | null
          first_name: string
          id: string
          last_contact: string | null
          last_name: string
          name: string | null
          phone: string
          project_timeline: string | null
          status: string
          style_preferences: string[] | null
          total_sales: number | null
          updated_at: string | null
        }
        Insert: {
          address: Json
          budget_max?: number | null
          budget_min?: number | null
          created_at?: string | null
          email?: string | null
          first_name: string
          id?: string
          last_contact?: string | null
          last_name: string
          name?: string | null
          phone: string
          project_timeline?: string | null
          status: string
          style_preferences?: string[] | null
          total_sales?: number | null
          updated_at?: string | null
        }
        Update: {
          address?: Json
          budget_max?: number | null
          budget_min?: number | null
          created_at?: string | null
          email?: string | null
          first_name?: string
          id?: string
          last_contact?: string | null
          last_name?: string
          name?: string | null
          phone?: string
          project_timeline?: string | null
          status?: string
          style_preferences?: string[] | null
          total_sales?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      notes: {
        Row: {
          action_items: string[] | null
          client_id: string | null
          content: string
          created_at: string | null
          created_by: string | null
          follow_up_date: string | null
          id: string
          importance: number | null
          meeting_outcome: string | null
          room_type: string | null
          sentiment: string | null
          tags: string[] | null
          type: string
          updated_at: string | null
        }
        Insert: {
          action_items?: string[] | null
          client_id?: string | null
          content: string
          created_at?: string | null
          created_by?: string | null
          follow_up_date?: string | null
          id?: string
          importance?: number | null
          meeting_outcome?: string | null
          room_type?: string | null
          sentiment?: string | null
          tags?: string[] | null
          type?: string
          updated_at?: string | null
        }
        Update: {
          action_items?: string[] | null
          client_id?: string | null
          content?: string
          created_at?: string | null
          created_by?: string | null
          follow_up_date?: string | null
          id?: string
          importance?: number | null
          meeting_outcome?: string | null
          room_type?: string | null
          sentiment?: string | null
          tags?: string[] | null
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      sale_items: {
        Row: {
          created_at: string | null
          id: string
          name: string
          price: number
          quantity: number
          sale_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          price: number
          quantity?: number
          sale_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          price?: number
          quantity?: number
          sale_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sale_items_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          amount: number
          client_id: string | null
          created_at: string | null
          id: string
          notes: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          client_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          client_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      sketches: {
        Row: {
          analysis: string | null
          client_id: string | null
          created_at: string | null
          description: string | null
          file_path: string
          id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          analysis?: string | null
          client_id?: string | null
          created_at?: string | null
          description?: string | null
          file_path: string
          id?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          analysis?: string | null
          client_id?: string | null
          created_at?: string | null
          description?: string | null
          file_path?: string
          id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          client_id: string | null
          created_at: string | null
          description: string | null
          due_date: string
          id: string
          priority: string
          status: string
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          description?: string | null
          due_date: string
          id?: string
          priority?: string
          status?: string
          title: string
          type?: string
          updated_at?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string
          id?: string
          priority?: string
          status?: string
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
