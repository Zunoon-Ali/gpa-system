import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const db = new Pool({
    connectionString:process.env.DATABASE_URL,
    ssl:{
        rejectUnauthorized : false,
    }
})

export default db;

// This code sets up a PostgreSQL database connection pool using the 'pg' library, loading credentials from environment variables via 'dotenv'.
// The 'pool' object facilitates efficient database interactions, including queries and transactions, with SSL configured to allow self-signed certificates for development.