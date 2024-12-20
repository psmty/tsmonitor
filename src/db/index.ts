import pg from 'pg';
import 'dotenv/config';

// Make sure we DO NOT "prerender" this function to allow the ENV variables to update on the fly
export const prerender = false;

const client = new pg.Client({
  host: process.env.POSTGRES_HOST, // 'localhost' or 'db',
  port: 5432,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
});

async function connect() {
  try {
    await client.connect();
  } catch (e) {
    console.error("Database connection error:", e);
    process.exit(1);
  }
}
await connect();

export { client as db };