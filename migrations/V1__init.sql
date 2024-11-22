CREATE TABLE IF NOT EXISTS sites (
    url TEXT PRIMARY KEY,
    settings JSON
);

INSERT INTO sites (url) VALUES 
    ('https://staging.tempus-resource.com/sg'), 
    ('https://alpha.tempus-resource.com/qa/next/normal');
