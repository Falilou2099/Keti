import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST, GET } from "@/app/api/receipts/scan/route";
import { NextRequest } from "next/server";

// Mock des dépendances
vi.mock("@/lib/gemini", () => ({
  analyzeReceipt: vi.fn().mockResolvedValue({
    merchant_name: "Carrefour",
    transaction_date: "2024-01-15",
    total_amount: 45.67,
    items: [
      {
        name: "Pain",
        quantity: 2,
        unit_price: 1.5,
        total_price: 3.0,
      },
    ],
    is_authentic: true,
    confidence_score: 95,
    suspicious_elements: [],
    analysis: "Le ticket semble authentique.",
  }),
  validateBase64Image: vi.fn().mockReturnValue(true),
}));

vi.mock("@/lib/db", () => ({
  default: {
    query: vi.fn().mockResolvedValue([
      {
        insertId: 1,
      },
      [],
    ]),
  },
}));

vi.mock("@/lib/auth", () => ({
  verifyAuth: vi.fn().mockResolvedValue({
    authenticated: true,
    userId: 1,
  }),
}));

describe("API /api/receipts/scan", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST - Scanner un ticket", () => {
    it("devrait scanner et enregistrer un ticket avec succès", async () => {
      const mockImage = "data:image/jpeg;base64,/9j/4AAQSkZJRg==";
      const request = new NextRequest("http://localhost:3000/api/receipts/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          cookie: "session_token=valid-token",
        },
        body: JSON.stringify({ image: mockImage }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.receipt).toBeDefined();
      expect(data.receipt.merchant_name).toBe("Carrefour");
      expect(data.receipt.total_amount).toBe(45.67);
    });

    it("devrait retourner une erreur 401 si non authentifié", async () => {
      const { verifyAuth } = await import("@/lib/auth");
      vi.mocked(verifyAuth).mockResolvedValueOnce({
        authenticated: false,
      });

      const request = new NextRequest("http://localhost:3000/api/receipts/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: "data:image/jpeg;base64,test" }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Non authentifié");
    });

    it("devrait retourner une erreur 400 si l'image est manquante", async () => {
      const request = new NextRequest("http://localhost:3000/api/receipts/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          cookie: "session_token=valid-token",
        },
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Image requise");
    });

    it("devrait retourner une erreur 400 si le format d'image est invalide", async () => {
      const { validateBase64Image } = await import("@/lib/gemini");
      vi.mocked(validateBase64Image).mockReturnValueOnce(false);

      const request = new NextRequest("http://localhost:3000/api/receipts/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          cookie: "session_token=valid-token",
        },
        body: JSON.stringify({ image: "invalid-image" }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("Format d'image invalide");
    });
  });

  describe("GET - Récupérer l'historique", () => {
    it("devrait récupérer l'historique des tickets", async () => {
      const db = (await import("@/lib/db")).default;
      vi.mocked(db.query).mockResolvedValueOnce([
        [
          {
            id: 1,
            merchant_name: "Carrefour",
            transaction_date: "2024-01-15",
            total_amount: 45.67,
            is_authentic: true,
            confidence_score: 95,
            items: JSON.stringify([{ name: "Pain", quantity: 2 }]),
            suspicious_elements: JSON.stringify([]),
            analysis: "Authentique",
            created_at: new Date(),
          },
        ],
        [],
      ]);

      vi.mocked(db.query).mockResolvedValueOnce([
        [{ total: 1 }],
        [],
      ]);

      const request = new NextRequest(
        "http://localhost:3000/api/receipts/scan?limit=20&offset=0",
        {
          method: "GET",
          headers: {
            cookie: "session_token=valid-token",
          },
        }
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.receipts).toBeDefined();
      expect(Array.isArray(data.receipts)).toBe(true);
      expect(data.total).toBe(1);
    });

    it("devrait retourner une erreur 401 si non authentifié pour GET", async () => {
      const { verifyAuth } = await import("@/lib/auth");
      vi.mocked(verifyAuth).mockResolvedValueOnce({
        authenticated: false,
      });

      const request = new NextRequest("http://localhost:3000/api/receipts/scan", {
        method: "GET",
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Non authentifié");
    });
  });
});
