const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: process.env.PGPORT || 5432,
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'postgres',
  database: process.env.PGDATABASE || 'lukwealth',
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

async function initDB() {
  try {
    const schemaPath = path.join(__dirname, 'migrations', '001_initial_schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    await pool.query(schema);
    console.log('PostgreSQL schema initialized successfully');
  } catch (err) {
    console.error('Error initializing PostgreSQL schema', err);
  }
}

module.exports = {
  query: (text, params) => pool.query(text, params),
  initDB,
  pool
};