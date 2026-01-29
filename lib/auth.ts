import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import db from "@/lib/db";

// Types
interface User {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
}

interface Session {
  id: number;
  userId: number;
  token: string;
  expiresAt: Date;
}

// Utils
function generateToken(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < 64; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

// Users
export async function createUser(name: string, email: string, password: string): Promise<User | null> {
  const existing = await db.query("SELECT id FROM users WHERE email = $1", [email]);
  if (existing.rows.length > 0) return null;

  const hash = await bcrypt.hash(password, 10);

  const result: any = await db.query(
    "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id",
    [name, email, hash]
  );

  return {
    id: result.rows[0].id,
    name,
    email,
    passwordHash: hash,
    createdAt: new Date(),
  };
}

export async function findUserByEmail(email: string): Promise<any | null> {
  const result: any = await db.query("SELECT * FROM users WHERE email = $1", [email]);
  return result.rows.length ? result.rows[0] : null;
}

export async function findUserById(id: number): Promise<any | null> {
  const result: any = await db.query("SELECT * FROM users WHERE id = $1", [id]);
  return result.rows.length ? result.rows[0] : null;
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Sessions
export async function createSession(userId: number): Promise<Session> {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const result: any = await db.query(
    "INSERT INTO sessions (user_id, token, expires_at) VALUES ($1, $2, $3) RETURNING id",
    [userId, token, expiresAt]
  );

  return {
    id: result.rows[0].id,
    userId,
    token,
    expiresAt,
  };
}

export async function findSessionByToken(token: string): Promise<any | null> {
  const result: any = await db.query(
    "SELECT * FROM sessions WHERE token = $1 AND expires_at > NOW()",
    [token]
  );
  return result.rows.length ? result.rows[0] : null;
}

export async function deleteSession(token: string): Promise<void> {
  await db.query("DELETE FROM sessions WHERE token = $1", [token]);
}

// Cookies
export async function getCurrentUser(): Promise<any | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  if (!token) return null;

  const session = await findSessionByToken(token);
  if (!session) return null;

  return await findUserById(session.user_id);
}

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set("session_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60,
    path: "/",
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("session_token");
}

// Verify authentication from request
export async function verifyAuth(request: Request): Promise<{ authenticated: boolean; userId?: number }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    if (!token) {
      return { authenticated: false };
    }

    const session = await findSessionByToken(token);
    if (!session) {
      return { authenticated: false };
    }

    return { authenticated: true, userId: session.user_id };
  } catch (error) {
    console.error("Auth verification error:", error);
    return { authenticated: false };
  }
}
