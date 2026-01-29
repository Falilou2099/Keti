import { describe, it, expect, vi, beforeEach } from "vitest";
import { analyzeReceipt, validateBase64Image } from "@/lib/gemini";

// Mock de l'API Google Generative AI
vi.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: vi.fn().mockReturnValue({
      generateContent: vi.fn().mockResolvedValue({
        response: {
          text: vi.fn().mockReturnValue(
            JSON.stringify({
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
            })
          ),
        },
      }),
    }),
  })),
}));

describe("gemini.ts - Analyse de tickets", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GEMINI_API_KEY = "test-api-key";
  });

  describe("validateBase64Image", () => {
    it("devrait valider une image JPEG base64 correcte", () => {
      const validBase64 = "data:image/jpeg;base64,/9j/4AAQSkZJRg==";
      expect(validateBase64Image(validBase64)).toBe(true);
    });

    it("devrait valider une image PNG base64 correcte", () => {
      const validBase64 = "data:image/png;base64,iVBORw0KGgo=";
      expect(validateBase64Image(validBase64)).toBe(true);
    });

    it("devrait rejeter une image sans préfixe base64", () => {
      const invalidBase64 = "/9j/4AAQSkZJRg==";
      expect(validateBase64Image(invalidBase64)).toBe(false);
    });

    it("devrait rejeter un format d'image non supporté", () => {
      const invalidBase64 = "data:image/bmp;base64,Qk1==";
      expect(validateBase64Image(invalidBase64)).toBe(false);
    });
  });

  describe("analyzeReceipt", () => {
    it("devrait analyser un ticket avec succès", async () => {
      const mockImage = "data:image/jpeg;base64,/9j/4AAQSkZJRg==";
      const result = await analyzeReceipt(mockImage);

      expect(result).toBeDefined();
      expect(result.merchant_name).toBe("Carrefour");
      expect(result.transaction_date).toBe("2024-01-15");
      expect(result.total_amount).toBe(45.67);
      expect(result.is_authentic).toBe(true);
      expect(result.confidence_score).toBe(95);
      expect(result.items).toHaveLength(1);
      expect(result.items[0].name).toBe("Pain");
    });

    it("devrait lever une erreur si GEMINI_API_KEY n'est pas définie", async () => {
      delete process.env.GEMINI_API_KEY;
      const mockImage = "data:image/jpeg;base64,/9j/4AAQSkZJRg==";

      await expect(analyzeReceipt(mockImage)).rejects.toThrow(
        "GEMINI_API_KEY n'est pas configurée"
      );
    });

    it("devrait extraire correctement les articles du ticket", async () => {
      const mockImage = "data:image/jpeg;base64,/9j/4AAQSkZJRg==";
      const result = await analyzeReceipt(mockImage);

      expect(result.items).toBeDefined();
      expect(Array.isArray(result.items)).toBe(true);
      expect(result.items[0]).toHaveProperty("name");
      expect(result.items[0]).toHaveProperty("quantity");
      expect(result.items[0]).toHaveProperty("unit_price");
      expect(result.items[0]).toHaveProperty("total_price");
    });

    it("devrait retourner un score de confiance entre 0 et 100", async () => {
      const mockImage = "data:image/jpeg;base64,/9j/4AAQSkZJRg==";
      const result = await analyzeReceipt(mockImage);

      expect(result.confidence_score).toBeGreaterThanOrEqual(0);
      expect(result.confidence_score).toBeLessThanOrEqual(100);
    });

    it("devrait détecter les éléments suspects", async () => {
      const mockImage = "data:image/jpeg;base64,/9j/4AAQSkZJRg==";
      const result = await analyzeReceipt(mockImage);

      expect(result.suspicious_elements).toBeDefined();
      expect(Array.isArray(result.suspicious_elements)).toBe(true);
    });
  });
});
