import { neonConfig, Pool } from "@neondatabase/serverless";
import ws from "ws";

// Configuration pour WebSocket (nécessaire pour Neon)
neonConfig.webSocketConstructor = ws;

// Créer le pool de connexion Neon
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export default pool;
