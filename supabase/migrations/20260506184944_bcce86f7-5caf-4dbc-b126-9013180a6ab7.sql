
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

INSERT INTO public.products (name, description, price, image_url, category, is_available) VALUES
('Truffle Burger', 'Wagyu beef, black truffle aioli, aged cheddar', 18.50, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800', 'Burgers', true),
('Margherita Pizza', 'San marzano tomato, fresh mozzarella, basil', 16.00, 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=800', 'Pizza', true),
('Spicy Tuna Roll', 'Sushi-grade tuna, sriracha, scallions', 14.00, 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800', 'Sushi', true),
('Avocado Toast', 'Sourdough, smashed avocado, chili flakes, lime', 11.00, 'https://images.unsplash.com/photo-1603046891744-1f76eb10aec1?w=800', 'Breakfast', true),
('Caesar Salad', 'Romaine, parmesan, anchovy dressing, croutons', 12.50, 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=800', 'Salads', true),
('Pad Thai', 'Rice noodles, prawns, peanuts, lime', 15.00, 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800', 'Asian', true),
('Chocolate Lava', 'Molten chocolate cake, vanilla ice cream', 9.00, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800', 'Desserts', true),
('Iced Latte', 'Cold brew espresso, oat milk', 5.50, 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=800', 'Drinks', true);
