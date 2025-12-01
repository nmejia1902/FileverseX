// backend/db.js
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3307,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function testDbConnection() {
  try {
    const [rows] = await pool.query('SELECT 1 AS result');
    console.log('✅ Conexión a MySQL OK:', rows);
  } catch (error) {
    console.error('❌ Error al conectar a MySQL:', error);
  }
}

module.exports = {
  pool,
  testDbConnection,
};
