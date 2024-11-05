-- Sites
DROP TABLE IF EXISTS sites;
CREATE TABLE IF NOT EXISTS sites (url TEXT PRIMARY KEY, settings JSON);
INSERT INTO sites (url) VALUES ('https://staging.tempus-resource.com/sg'), ('https://alpha.tempus-resource.com/qa/next/normal');

-- Attributes
DROP TABLE IF EXISTS attributes;
CREATE TABLE IF NOT EXISTS attributes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('string', 'number', 'selection')),
    members TEXT[] DEFAULT NULL,
    allow_new_members BOOLEAN DEFAULT FALSE
);

INSERT INTO attributes (name, type, members, allow_new_members)
VALUES
    ('Customer', 'string', NULL, FALSE),
    ('Environment', 'selection', ARRAY['Dev', 'Prod', 'Trial'], FALSE),
    ('CSM', 'string', NULL, FALSE),
    ('Has integration', 'selection', ARRAY['Yes', 'No'], FALSE),
    ('Resources', 'selection', NULL, TRUE);
