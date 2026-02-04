const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  password: 'Bunny2020$',
  host: 'localhost',
  database: 'resumes',
  port: 5432
});

module.exports = pool;
