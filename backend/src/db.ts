// db.ts
import mysql from 'mysql2/promise';

export const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'ton_mot_de_passe',
  database: 'labvision',
  waitForConnections: true,
  connectionLimit: 10,
});