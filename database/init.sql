-- ClashRoyale.Web Database Schema
-- Версия: 1.0
-- Дата: 2024-05-26

-- Создание расширений
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Таблица пользователей
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    trophies INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    experience INTEGER DEFAULT 0,
    gems INTEGER DEFAULT 100, -- стартовые самоцветы
    gold INTEGER DEFAULT 1000, -- стартовое золото
    avatar_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- Таблица карт
CREATE TABLE cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    elixir_cost INTEGER NOT NULL CHECK (elixir_cost >= 1 AND elixir_cost <= 10),
    rarity VARCHAR(20) NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
    max_level INTEGER NOT NULL DEFAULT 13,
    health INTEGER NOT NULL,
    damage INTEGER NOT NULL,
    speed DECIMAL(3,1) DEFAULT 1.0,
    range DECIMAL(4,1) DEFAULT 1.0,
    target_type VARCHAR(20) DEFAULT 'ground' CHECK (target_type IN ('ground', 'air', 'both')),
    card_type VARCHAR(20) NOT NULL CHECK (card_type IN ('troop', 'spell', 'building')),
    image_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица карт пользователей
CREATE TABLE user_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    level INTEGER NOT NULL DEFAULT 1,
    count INTEGER NOT NULL DEFAULT 0, -- количество карт для улучшения
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, card_id)
);

-- Таблица колод
CREATE TABLE decks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица карт в колодах
CREATE TABLE deck_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deck_id UUID NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
    card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    slot_number INTEGER NOT NULL CHECK (slot_number >= 1 AND slot_number <= 8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(deck_id, slot_number),
    UNIQUE(deck_id, card_id)
);

-- Таблица матчей
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player1_id UUID NOT NULL REFERENCES users(id),
    player2_id UUID NOT NULL REFERENCES users(id),
    winner_id UUID REFERENCES users(id),
    status VARCHAR(20) NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'finished', 'cancelled')),
    started_at TIMESTAMP WITH TIME ZONE,
    finished_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    player1_trophies_before INTEGER,
    player2_trophies_before INTEGER,
    player1_trophies_after INTEGER,
    player2_trophies_after INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица игровых действий
CREATE TABLE game_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES users(id),
    action_type VARCHAR(50) NOT NULL, -- 'play_card', 'emote', 'surrender'
    action_data JSONB NOT NULL, -- данные действия
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    game_time INTEGER NOT NULL -- время в игре в секундах
);

-- Таблица сундуков
CREATE TABLE chests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    chest_type VARCHAR(20) NOT NULL CHECK (chest_type IN ('silver', 'gold', 'magic', 'giant', 'epic', 'legendary')),
    status VARCHAR(20) NOT NULL DEFAULT 'locked' CHECK (status IN ('locked', 'unlocking', 'ready', 'opened')),
    unlock_time INTEGER NOT NULL, -- время разблокировки в секундах
    started_unlock_at TIMESTAMP WITH TIME ZONE,
    ready_at TIMESTAMP WITH TIME ZONE,
    opened_at TIMESTAMP WITH TIME ZONE,
    rewards JSONB, -- награды из сундука
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица лидерборда (кешированная таблица для быстрого доступа)
CREATE TABLE leaderboard (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    username VARCHAR(50) NOT NULL,
    trophies INTEGER NOT NULL,
    level INTEGER NOT NULL,
    rank INTEGER,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица refresh токенов
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы для оптимизации запросов
CREATE INDEX idx_users_trophies ON users(trophies DESC);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_user_cards_user_id ON user_cards(user_id);
CREATE INDEX idx_user_cards_card_id ON user_cards(card_id);
CREATE INDEX idx_decks_user_id ON decks(user_id);
CREATE INDEX idx_deck_cards_deck_id ON deck_cards(deck_id);
CREATE INDEX idx_matches_player1_id ON matches(player1_id);
CREATE INDEX idx_matches_player2_id ON matches(player2_id);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_game_actions_match_id ON game_actions(match_id);
CREATE INDEX idx_game_actions_timestamp ON game_actions(timestamp);
CREATE INDEX idx_chests_user_id ON chests(user_id);
CREATE INDEX idx_chests_status ON chests(status);
CREATE INDEX idx_leaderboard_trophies ON leaderboard(trophies DESC);

-- Функция для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггеры для автоматического обновления updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_cards_updated_at BEFORE UPDATE ON user_cards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_decks_updated_at BEFORE UPDATE ON decks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Вставка базовых карт
INSERT INTO cards (name, description, elixir_cost, rarity, health, damage, speed, range, target_type, card_type) VALUES
-- Троопы
('Knight', 'A tough melee fighter. The Mustache is a source of inspiration for all who follow the Code of Knights.', 3, 'common', 1400, 160, 1.0, 1.0, 'ground', 'troop'),
('Archers', 'A pair of lightly armored ranged attackers. They''re wonderful, but fragile!', 3, 'common', 125, 40, 1.0, 5.0, 'both', 'troop'),
('Goblins', 'Three fast, unarmored melee attackers. Small, fast, green and mean!', 2, 'common', 100, 50, 1.0, 1.0, 'ground', 'troop'),
('Giant', 'Slow but durable, only attacks buildings. A real one-man wrecking crew!', 5, 'rare', 2000, 100, 0.5, 1.0, 'ground', 'troop'),
('Musketeer', 'Don't be fooled by her delicate appearance. She will snipe anyone who gets in her way!', 4, 'rare', 340, 100, 1.0, 6.0, 'both', 'troop'),
('Wizard', 'The most awesome man to ever set foot in the arena!', 5, 'rare', 340, 130, 1.0, 5.5, 'both', 'troop'),
('Dragon', 'Flying troop that deals splash damage. Baby Dragon finds cute things and burns them.', 4, 'epic', 800, 100, 1.0, 3.5, 'both', 'troop'),
('Prince', 'Don't be fooled by his cute appearance. This little guy is a force to be reckoned with!', 5, 'epic', 1400, 325, 1.0, 1.0, 'ground', 'troop'),
('P.E.K.K.A', 'A heavily armored, slow melee fighter. Swings from the hip, but packs a huge punch!', 7, 'epic', 1300, 600, 0.5, 1.0, 'ground', 'troop'),
('Skeleton Army', 'Spawns an army of Skeletons. Meet Larry and his friends Harry, Terry, Gerry, Larry, Mary, Jerry, Kerry, and Tom.', 3, 'epic', 30, 30, 1.0, 1.0, 'ground', 'troop'),
('Witch', 'Spawns Skeletons, shoots destructo beams, and has massive style!', 5, 'epic', 260, 69, 1.0, 5.0, 'both', 'troop'),
('Lava Hound', 'A flying tank that explodes into Lava Pups when destroyed!', 7, 'legendary', 3000, 45, 1.0, 2.0, 'both', 'troop'),

-- Заклинания
('Arrows', 'Arrows pepper a large area, dealing damage to everyone hit. Reduced damage to Crown Towers.', 3, 'common', 0, 90, 0.0, 4.0, 'both', 'spell'),
('Fireball', 'Incinerates a small area, dealing high damage. Reduced damage to Crown Towers.', 4, 'rare', 0, 325, 0.0, 2.5, 'both', 'spell'),
('Lightning', 'Strikes the three highest health enemies in the target area. Reduced damage to Crown Towers.', 6, 'epic', 0, 400, 0.0, 3.5, 'both', 'spell'),
('Rocket', 'Deals high damage to a small area. Reduced damage to Crown Towers.', 6, 'rare', 0, 493, 0.0, 2.0, 'both', 'spell'),

-- Здания
('Cannon', 'Defensive building. Shoots cannonballs with deadly effect, but cannot target flying troops.', 3, 'common', 380, 60, 0.0, 5.5, 'ground', 'building'),
('Tesla', 'Defensive building. Hidden underground, the Tesla surprises enemies with electric bolts!', 4, 'common', 350, 60, 0.0, 5.5, 'both', 'building'),
('Inferno Tower', 'Defensive building. Burns through even the biggest and toughest enemies!', 5, 'rare', 800, 30, 0.0, 6.0, 'both', 'building'),
('X-Bow', 'Defensive building. Shoots bolts with deadly accuracy!', 6, 'epic', 1000, 26, 0.0, 11.5, 'ground', 'building');

-- Создание пользователя по умолчанию для тестирования
INSERT INTO users (username, email, password_hash, trophies, level, experience, gems, gold) VALUES
('testuser', 'test@example.com', '$2b$10$rQZ8K9LmN2pO3qR4sT5uVeWxYzA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q', 1000, 5, 2500, 500, 5000);

-- Выдача стартовых карт пользователю
INSERT INTO user_cards (user_id, card_id, level, count)
SELECT 
    u.id,
    c.id,
    1,
    CASE 
        WHEN c.rarity = 'common' THEN 10
        WHEN c.rarity = 'rare' THEN 5
        WHEN c.rarity = 'epic' THEN 2
        WHEN c.rarity = 'legendary' THEN 1
    END
FROM users u, cards c
WHERE u.username = 'testuser';

-- Создание стартовой колоды
INSERT INTO decks (user_id, name, is_active)
SELECT id, 'Starter Deck', true
FROM users
WHERE username = 'testuser';

-- Добавление карт в стартовую колоду
INSERT INTO deck_cards (deck_id, card_id, slot_number)
SELECT 
    d.id,
    c.id,
    ROW_NUMBER() OVER (ORDER BY c.elixir_cost, c.name)
FROM decks d
JOIN users u ON d.user_id = u.id
JOIN cards c ON c.name IN ('Knight', 'Archers', 'Goblins', 'Giant', 'Musketeer', 'Wizard', 'Arrows', 'Cannon')
WHERE u.username = 'testuser' AND d.name = 'Starter Deck';
