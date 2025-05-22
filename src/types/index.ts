// Client Types
export interface Address {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  deliveryNotes?: string;
}

export type ClientStatus = 'lead' | 'active' | 'inactive' | 'project';

export interface Client {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  status: ClientStatus;
  source?: string;
  budget?: number;
  stylePreferences?: string[];
  roomTypes?: string[];
  lastContactDate?: string;
  nextFollowUpDate?: string;
  notes?: string;
  address?: Address;
  created_at: string;
  updated_at?: string;
  // Legacy fields (for backward compatibility)
  last_contact?: string;
  style_preferences?: string[];
  total_sales?: number;
  
  // Computed property for full name
  fullName?: string;
}

// Sale Types
export type SaleStatus = 
  | 'lead'
  | 'needs_quote'
  | 'quote_sent'
  | 'follow_up'
  | 'measurement'
  | 'design'
  | 'presentation'
  | 'negotiation'
  | 'closed_won'
  | 'closed_lost';

export type SaleItemStatus = 'pending' | 'ordered' | 'delivered' | 'returned';

export interface SaleItem {
  id: string;
  productId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: SaleItemStatus;
  expectedDeliveryDate?: string;
  deliveryNotes?: string;
  created_at: string;
  updated_at?: string;
}

export interface Sale {
  id: string;
  clientId: string;
  status: SaleStatus;
  value: number;
  probability: number;
  expectedCloseDate?: string;
  items: SaleItem[];
  notes?: string;
  created_at: string;
  updated_at?: string;
}

// Task Types
export type TaskType = 
  | 'call'
  | 'email'
  | 'meeting'
  | 'follow_up'
  | 'quote'
  | 'measurement'
  | 'design'
  | 'presentation'
  | 'order'
  | 'delivery'
  | 'other';

export type TaskStatus = 'not_started' | 'in_progress' | 'completed' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: string;
  title: string;
  description?: string;
  type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  clientId?: string;
  saleId?: string;
  assignedTo?: string;
  completedAt?: string;
  created_at: string;
  updated_at?: string;
}
