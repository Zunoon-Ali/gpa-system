import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Function to get a new client connection
async function getDbClient() {
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  await client.connect();
  return client;
}

export default getDbClient;
