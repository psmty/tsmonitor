import pg from 'pg';

// Make sure we DO NOT "prerender" this function to allow the ENV variables to update on the fly
export const prerender = false;

const client = new pg.Client({
  host: import.meta.env.POSTGRES_HOST,
  port: import.meta.env.POSTGRES_PORT,
  database: import.meta.env.POSTGRES_DB,
  user: import.meta.env.POSTGRES_USER,
  password: import.meta.env.POSTGRES_PASSWORD,
});

try {
  await client.connect();
} catch (e) {
  console.error("Database connection error:", e);
  process.exit(1);
}

export { client as db };