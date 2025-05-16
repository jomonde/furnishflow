-- Make email column nullable in clients table
ALTER TABLE clients 
ALTER COLUMN email DROP NOT NULL;
