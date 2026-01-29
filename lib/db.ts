import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: "localhost",
  user: "root",        
  password: "",        
  database: "keti",
  waitForConnections: true,
});

export default pool;

