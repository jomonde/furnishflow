-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Clients table
create table clients (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  email text,
  phone text,
  status text not null default 'lead',
  source text,
  budget numeric,
  style_preferences text[],
  room_types text[],
  last_contact_date timestamp with time zone,
  next_follow_up_date timestamp with time zone,
  notes text,
  address jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Sales table
create table sales (
  id uuid default uuid_generate_v4() primary key,
  client_id uuid references clients(id) on delete cascade,
  status text not null default 'lead',
  value numeric not null,
  probability integer not null default 0,
  expected_close_date timestamp with time zone,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Sale items table
create table sale_items (
  id uuid default uuid_generate_v4() primary key,
  sale_id uuid references sales(id) on delete cascade,
  product_id text,
  description text not null,
  quantity integer not null default 1,
  unit_price numeric not null,
  total_price numeric not null,
  status text not null default 'pending',
  expected_delivery_date timestamp with time zone,
  delivery_notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tasks table
create table tasks (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  type text not null,
  status text not null default 'not_started',
  priority text not null default 'medium',
  due_date timestamp with time zone,
  client_id uuid references clients(id) on delete cascade,
  sale_id uuid references sales(id) on delete set null,
  assigned_to uuid,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for better performance
create index idx_tasks_client_id on tasks(client_id);
create index idx_tasks_sale_id on tasks(sale_id);
create index idx_sales_client_id on sales(client_id);
create index idx_sale_items_sale_id on sale_items(sale_id);

-- Enable Row Level Security
alter table clients enable row level security;
alter table sales enable row level security;
alter table sale_items enable row level security;
alter table tasks enable row level security;
