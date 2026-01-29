import { neonConfig, Pool } from "@neondatabase/serverless";
import ws from "ws";

// Configuration pour WebSocket (nécessaire pour Neon en environnement Node.js)
if (typeof window === "undefined") {
  neonConfig.webSocketConstructor = ws;
}

// Désactiver le pooling pour éviter les problèmes de connexion
neonConfig.poolQueryViaFetch = true;

// Créer le pool de connexion Neon
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export default pool;
