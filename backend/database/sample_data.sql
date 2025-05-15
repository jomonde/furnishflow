-- Sample Clients
INSERT INTO clients (first_name, last_name, email, phone, lifetime_spend, last_contact, status) VALUES
    ('Sarah', 'Johnson', 'sarah.j@email.com', '(555) 123-4567', 12500.00, NOW() - INTERVAL '2 days', 'active'),
    ('Michael', 'Chen', 'mchen@email.com', '(555) 234-5678', 8750.00, NOW() - INTERVAL '5 days', 'active'),
    ('Emily', 'Rodriguez', 'emily.r@email.com', '(555) 345-6789', 15200.00, NOW() - INTERVAL '1 day', 'active'),
    ('James', 'Wilson', 'jwilson@email.com', '(555) 456-7890', 4300.00, NOW() - INTERVAL '10 days', 'active'),
    ('Lisa', 'Thompson', 'lisa.t@email.com', '(555) 567-8901', 22800.00, NOW() - INTERVAL '3 days', 'active');


-- Sample Sales
INSERT INTO sales (client_id, amount, status, notes) VALUES
    ((SELECT id FROM clients WHERE email = 'sarah.j@email.com'), 4500.00, 'closed', 'Complete living room set'),
    ((SELECT id FROM clients WHERE email = 'mchen@email.com'), 2800.00, 'open', 'Pending delivery of dining set'),
    ((SELECT id FROM clients WHERE email = 'emily.r@email.com'), 6200.00, 'closed', 'Master bedroom furniture'),
    ((SELECT id FROM clients WHERE email = 'lisa.t@email.com'), 12800.00, 'closed', 'Full house furnishing'),
    ((SELECT id FROM clients WHERE email = 'sarah.j@email.com'), 8000.00, 'open', 'Home office setup');


-- Sample Sale Items
INSERT INTO sale_items (sale_id, name, quantity, price) VALUES
    ((SELECT id FROM sales WHERE notes = 'Complete living room set' LIMIT 1), 'Luxury Sofa', 1, 2500.00),
    ((SELECT id FROM sales WHERE notes = 'Complete living room set' LIMIT 1), 'Coffee Table', 1, 800.00),
    ((SELECT id FROM sales WHERE notes = 'Complete living room set' LIMIT 1), 'Armchair', 2, 600.00),
    ((SELECT id FROM sales WHERE notes = 'Pending delivery of dining set' LIMIT 1), 'Dining Table', 1, 1800.00),
    ((SELECT id FROM sales WHERE notes = 'Pending delivery of dining set' LIMIT 1), 'Dining Chair', 6, 166.67),
    ((SELECT id FROM sales WHERE notes = 'Home office setup' LIMIT 1), 'Executive Desk', 1, 3500.00),
    ((SELECT id FROM sales WHERE notes = 'Home office setup' LIMIT 1), 'Ergonomic Chair', 1, 1200.00),
    ((SELECT id FROM sales WHERE notes = 'Home office setup' LIMIT 1), 'Bookshelf', 2, 1650.00);


-- Sample Tasks
INSERT INTO tasks (client_id, title, description, due_date, status, priority, type) VALUES
    ((SELECT id FROM clients WHERE email = 'mchen@email.com'), 'Follow up on dining set delivery', 'Confirm delivery date and time with logistics', NOW() + INTERVAL '2 days', 'pending', 'high', 'manual'),
    ((SELECT id FROM clients WHERE email = 'sarah.j@email.com'), 'Home office installation check', 'Schedule installation team for desk and shelving', NOW() + INTERVAL '5 days', 'pending', 'medium', 'manual'),
    ((SELECT id FROM clients WHERE email = 'lisa.t@email.com'), 'Customer satisfaction survey', 'Follow up on recent full house furnishing', NOW() + INTERVAL '1 day', 'pending', 'low', 'ai_generated'),
    ((SELECT id FROM clients WHERE email = 'emily.r@email.com'), 'Bedroom accessories consultation', 'Discuss additional decor options for master bedroom', NOW() + INTERVAL '3 days', 'pending', 'medium', 'manual');


-- Sample Notes
INSERT INTO notes (client_id, content, type, tags) VALUES
    ((SELECT id FROM clients WHERE email = 'sarah.j@email.com'), 'Prefers modern design. Looking to furnish entire home office with matching pieces.', 'general', ARRAY['preferences', 'style']),
    ((SELECT id FROM clients WHERE email = 'mchen@email.com'), 'Concerned about dining chair fabric durability. Has young children.', 'follow-up', ARRAY['concerns', 'family']),
    ((SELECT id FROM clients WHERE email = 'emily.r@email.com'), 'AI Analysis: High potential for additional bedroom accessories sale based on previous purchases.', 'ai-generated', ARRAY['opportunity', 'upsell']),
    ((SELECT id FROM clients WHERE email = 'lisa.t@email.com'), 'Excellent experience with full house furnishing. Interested in seasonal decor updates.', 'general', ARRAY['feedback', 'opportunity']);


-- Sample Sketches
INSERT INTO sketches (client_id, title, description, file_path, analysis) VALUES
    ((SELECT id FROM clients WHERE email = 'sarah.j@email.com'), 'Home Office Layout', 'Initial sketch of home office arrangement', '/sketches/home_office_001.jpg', 'Room dimensions: 15x12. Good natural light. Optimal for L-shaped desk configuration.'),
    ((SELECT id FROM clients WHERE email = 'mchen@email.com'), 'Dining Room Setup', 'Proposed dining room layout', '/sketches/dining_001.jpg', 'Space allows for 6-8 person dining set. Consider buffet along north wall.'),
    ((SELECT id FROM clients WHERE email = 'lisa.t@email.com'), 'Living Room Design', 'Complete living room layout with measurements', '/sketches/living_001.jpg', 'Open concept space. Focus on conversation area with secondary TV viewing zone.');


-- Update lifetime spend based on closed sales
UPDATE clients c
SET lifetime_spend = (
    SELECT COALESCE(SUM(amount), 0)
    FROM sales s
    WHERE s.client_id = c.id
    AND s.status = 'closed'
);
