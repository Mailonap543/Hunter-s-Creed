-- =====================================================
-- SHADOW CODE: SUPERNATURAL LORE - DATABASE SCHEMA
-- =====================================================
-- PostgreSQL/MySQL Database for Hunter's Progress System
-- =====================================================

-- =====================================================
-- ENUMS
-- =====================================================

CREATE TYPE hunter_title AS ENUM (
    'Curioso', 
    'Iniciante', 
    'Aprendiz', 
    'Caçador', 
    'Caçador Sênior', 
    'Mestre Caçador', 
    'Lendário', 
    'Lenda Viva'
);

CREATE TYPE skill_name AS ENUM (
    'JAVA', 
    'ANGULAR', 
    'SPRING', 
    'REACT', 
    'JPN', 
    'ENG'
);

CREATE TYPE difficulty_level AS ENUM (
    'EASY', 
    'MEDIUM', 
    'HARD'
);

CREATE TYPE region_type AS ENUM (
    'NEW_ORLEANS', 
    'TOKYO', 
    'GLOBAL'
);

-- =====================================================
-- TABLES
-- =====================================================

-- Tabela de Caçadores
CREATE TABLE hunters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    title hunter_title DEFAULT 'Curioso',
    hearts INTEGER DEFAULT 5,
    max_hearts INTEGER DEFAULT 5,
    mana_points INTEGER DEFAULT 100,
    max_mana_points INTEGER DEFAULT 100,
    region region_type DEFAULT 'GLOBAL',
    current_mission_id VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Progresso por Habilidade
CREATE TABLE hunter_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hunter_id UUID REFERENCES hunters(id) ON DELETE CASCADE,
    skill_name skill_name NOT NULL,
    skill_points INTEGER DEFAULT 0,
    current_difficulty difficulty_level DEFAULT 'EASY',
    streak_days INTEGER DEFAULT 0,
    best_streak INTEGER DEFAULT 0,
    total_correct_answers INTEGER DEFAULT 0,
    total_wrong_answers INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(hunter_id, skill_name)
);

-- Missões do Caçador
CREATE TABLE hunter_missions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hunter_id UUID REFERENCES hunters(id) ON DELETE CASCADE,
    mission_id VARCHAR(50) NOT NULL,
    mission_title VARCHAR(100) NOT NULL,
    region region_type NOT NULL,
    status VARCHAR(20) DEFAULT 'LOCKED', -- LOCKED, AVAILABLE, IN_PROGRESS, COMPLETED, FAILED
    attempts INTEGER DEFAULT 0,
    best_time_seconds INTEGER,
    xp_earned INTEGER DEFAULT 0,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(hunter_id, mission_id)
);

-- Logs de Caçada (Erros e Acertos)
CREATE TABLE hunt_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hunter_id UUID REFERENCES hunters(id) ON DELETE CASCADE,
    mission_id VARCHAR(50),
    topic VARCHAR(100) NOT NULL,
    region region_type NOT NULL,
    skill_name skill_name,
    error_description TEXT,
    player_answer TEXT,
    expected_answer TEXT,
    is_voice_attempt BOOLEAN DEFAULT FALSE,
    is_correct BOOLEAN NOT NULL,
    xp_earned INTEGER DEFAULT 0,
    hearts_lost INTEGER DEFAULT 0,
    feedback_narrativo TEXT,
    feedback_tecnico TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inventário de Itens
CREATE TABLE hunter_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hunter_id UUID REFERENCES hunters(id) ON DELETE CASCADE,
    item_id VARCHAR(50) NOT NULL,
    item_name VARCHAR(100) NOT NULL,
    item_type VARCHAR(30) NOT NULL, -- WEAPON, ARMOR, CONSUMABLE, COSMETIC
    item_rarity VARCHAR(20) DEFAULT 'COMMON', -- COMMON, RARE, EPIC, LEGENDARY
    is_equipped BOOLEAN DEFAULT FALSE,
    obtained_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(hunter_id, item_id)
);

-- Conquistas
CREATE TABLE hunter_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hunter_id UUID REFERENCES hunters(id) ON DELETE CASCADE,
    achievement_id VARCHAR(50) NOT NULL,
    achievement_name VARCHAR(100) NOT NULL,
    description TEXT,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(hunter_id, achievement_id)
);

-- Histórico de Level Up
CREATE TABLE level_up_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hunter_id UUID REFERENCES hunters(id) ON DELETE CASCADE,
    old_level INTEGER NOT NULL,
    new_level INTEGER NOT NULL,
    old_title hunter_title,
    new_title hunter_title,
    xp_at_level_up INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sessões de Jogo
CREATE TABLE game_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hunter_id UUID REFERENCES hunters(id) ON DELETE CASCADE,
    region region_type NOT NULL,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    missions_completed INTEGER DEFAULT 0,
    total_xp_earned INTEGER DEFAULT 0,
    hearts_lost INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_hunters_username ON hunters(username);
CREATE INDEX idx_hunters_email ON hunters(email);
CREATE INDEX idx_hunter_skills_hunter_id ON hunter_skills(hunter_id);
CREATE INDEX idx_hunt_logs_hunter_id ON hunt_logs(hunter_id);
CREATE INDEX idx_hunt_logs_created_at ON hunt_logs(created_at);
CREATE INDEX idx_game_sessions_hunter_id ON game_sessions(hunter_id);

-- =====================================================
-- VIEWS
-- =====================================================

-- Visualização do Perfil do Caçador
CREATE VIEW hunter_profile_view AS
SELECT 
    h.id,
    h.username,
    h.email,
    h.xp,
    h.level,
    h.title,
    h.hearts,
    h.max_hearts,
    h.mana_points,
    h.max_mana_points,
    h.region,
    h.created_at,
    COUNT(DISTINCT hs.skill_name) as skills_unlocked,
    COUNT(DISTINCT hm.id) as missions_completed,
    COUNT(DISTINCT ha.id) as achievements_unlocked
FROM hunters h
LEFT JOIN hunter_skills hs ON h.id = hs.hunter_id
LEFT JOIN hunter_missions hm ON h.id = hm.hunter_id AND hm.status = 'COMPLETED'
LEFT JOIN hunter_achievements ha ON h.id = ha.hunter_id
GROUP BY h.id;

-- Estatísticas de Desempenho por Habilidade
CREATE VIEW skill_performance_view AS
SELECT 
    hs.hunter_id,
    hs.skill_name,
    hs.skill_points,
    hs.current_difficulty,
    hs.streak_days,
    hs.total_correct_answers,
    hs.total_wrong_answers,
    CASE 
        WHEN (hs.total_correct_answers + hs.total_wrong_answers) > 0 
        THEN ROUND((hs.total_correct_answers::float / (hs.total_correct_answers + hs.total_wrong_answers)) * 100, 2)
        ELSE 0 
    END as success_rate_percentage
FROM hunter_skills hs;

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Função para calcular nível baseado em XP
CREATE OR REPLACE FUNCTION calculate_level(p_xp INTEGER)
RETURNS INTEGER AS $$
BEGIN
    RETURN FLOOR(p_xp / 100) + 1;
END;
$$ LANGUAGE plpgsql;

-- Função para calcular título baseado no nível
CREATE OR REPLACE FUNCTION calculate_title(p_level INTEGER)
RETURNS hunter_title AS $$
BEGIN
    CASE 
        WHEN p_level >= 100 THEN RETURN 'Lenda Viva';
        WHEN p_level >= 90 THEN RETURN 'Lendário';
        WHEN p_level >= 70 THEN RETURN 'Mestre Caçador';
        WHEN p_level >= 50 THEN RETURN 'Caçador Sênior';
        WHEN p_level >= 30 THEN RETURN 'Caçador';
        WHEN p_level >= 15 THEN RETURN 'Aprendiz';
        WHEN p_level >= 5 THEN RETURN 'Iniciante';
        ELSE RETURN 'Curioso';
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar nível automaticamente
CREATE OR REPLACE FUNCTION update_hunter_level()
RETURNS TRIGGER AS $$
BEGIN
    NEW.level := calculate_level(NEW.xp);
    NEW.title := calculate_title(NEW.level);
    NEW.updated_at := CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_hunter_level
    BEFORE UPDATE ON hunters
    FOR EACH ROW
    EXECUTE FUNCTION update_hunter_level();

-- =====================================================
-- SEED DATA (MISSÕES INICIAIS)
-- =====================================================

-- Missões de New Orleans
INSERT INTO hunter_missions (hunter_id, mission_id, mission_title, region, status) 
SELECT h.id, 'mission_01', 'O Selo de Ferro', 'NEW_ORLEANS', 'AVAILABLE'
FROM hunters h;

INSERT INTO hunter_missions (hunter_id, mission_id, mission_title, region, status) 
SELECT h.id, 'mission_04', 'A Masmorra Spring Boot', 'NEW_ORLEANS', 'LOCKED'
FROM hunters h;

-- Missões de Tokyo
INSERT INTO hunter_missions (hunter_id, mission_id, mission_title, region, status) 
SELECT h.id, 'mission_02', 'O Portão Torii de Neon', 'TOKYO', 'AVAILABLE'
FROM hunters h;

INSERT INTO hunter_missions (hunter_id, mission_id, mission_title, region, status) 
SELECT h.id, 'mission_03', 'O Primeiro Contato', 'TOKYO', 'LOCKED'
FROM hunters h;

INSERT INTO hunter_missions (hunter_id, mission_id, mission_title, region, status) 
SELECT h.id, 'mission_05', 'A Torre Angular', 'TOKYO', 'LOCKED'
FROM hunters h;

-- =====================================================
-- SAMPLE QUERIES
-- =====================================================

-- Verificar progresso de um caçador
-- SELECT * FROM hunter_profile_view WHERE username = 'Player1';

-- Verificar desempenho em habilidades
-- SELECT * FROM skill_performance_view WHERE hunter_id = 'uuid-aqui';

-- Histórico de erros para análise da IA
-- SELECT * FROM hunt_logs WHERE hunter_id = 'uuid-aqui' ORDER BY created_at DESC LIMIT 10;
