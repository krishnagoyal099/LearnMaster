import { apiRequest } from "./queryClient";
import type {
  GenerateContentRequest,
  GenerateContentResponse,
} from "../../../shared/schema";

export async function generateContent(
  request: GenerateContentRequest
): Promise<GenerateContentResponse> {
  const response = await apiRequest("POST", "/api/generate-content", request);
  return response.json();
}
