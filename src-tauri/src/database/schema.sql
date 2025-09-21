-- Gallery table
CREATE TABLE IF NOT EXISTS gallery (
    id TEXT PRIMARY KEY,
    origin_image TEXT NOT NULL,
    effect_image TEXT NOT NULL,
    total_input_tokens INTEGER NOT NULL DEFAULT 0,
    total_ouput_tokens INTEGER NOT NULL DEFAULT 0,
    create_at INTEGER NOT NULL
);

-- Style table
CREATE TABLE IF NOT EXISTS style (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    prompt TEXT NOT NULL,
    tags TEXT NOT NULL DEFAULT '[]',
    create_at INTEGER NOT NULL,
    update_at INTEGER NOT NULL
);

-- Setting table
CREATE TABLE IF NOT EXISTS setting (
    id TEXT PRIMARY KEY,
    api_url TEXT NOT NULL,
    api_key TEXT NOT NULL,
    model TEXT NOT NULL,
    update_at INTEGER NOT NULL
);

-- Message table
CREATE TABLE IF NOT EXISTS message (
    id TEXT PRIMARY KEY,
    gallery_id TEXT NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    create_at INTEGER NOT NULL,
    FOREIGN KEY (gallery_id) REFERENCES gallery(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_gallery_create_at ON gallery(create_at DESC);
CREATE INDEX IF NOT EXISTS idx_style_name ON style(name);
CREATE INDEX IF NOT EXISTS idx_message_gallery_id ON message(gallery_id);
CREATE INDEX IF NOT EXISTS idx_message_create_at ON message(create_at DESC);