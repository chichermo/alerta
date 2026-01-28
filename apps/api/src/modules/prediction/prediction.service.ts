import { Injectable } from "@nestjs/common";

@Injectable()
export class PredictionService {
  async predict(payload: { type: string; lat: number; lng: number }) {
    try {
      const response = await fetch(
        process.env.AI_URL || "http://localhost:8000/predict",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!response.ok) {
        return { risk: "medio", confidence: 0.5 };
      }
      return response.json();
    } catch {
      return { risk: "medio", confidence: 0.5 };
    }
  }
}
