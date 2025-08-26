-- Insert championship data with correct player names
INSERT INTO championships (player_id, year, date, game_id) 
SELECT p.id, 2025, '2025-01-01'::timestamp with time zone, NULL
FROM players p
WHERE p.name IN ('Igor', 'Rods', 'Bernardo', 'pedrao', 'FJ', 'Gsilva', 'Victor', 'Guima', 'Quati', 'Gabrao', 'Lara', 'Fael', 'Kadim', 'Keller', 'joao m', 'joao', 'Ameba', 'Yago', 'Rod');

-- Add second championship for players with 2+ wins
INSERT INTO championships (player_id, year, date, game_id)
SELECT p.id, 2025, '2025-02-01'::timestamp with time zone, NULL
FROM players p
WHERE p.name IN ('Igor', 'Rods', 'Bernardo', 'pedrao', 'FJ', 'Gsilva', 'Victor', 'Guima');

-- Add third championship for players with 3 wins
INSERT INTO championships (player_id, year, date, game_id)
SELECT p.id, 2025, '2025-03-01'::timestamp with time zone, NULL
FROM players p
WHERE p.name IN ('Igor', 'Rods', 'Bernardo', 'pedrao', 'FJ');