import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: "localhost",
  user: "root",        
  password: "root",        
  database: "keti",
  waitForConnections: true,
});

export default pool;
