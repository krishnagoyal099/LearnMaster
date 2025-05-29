import { apiRequest } from "./queryClient";
import type {
  GenerateContentRequest,
  GenerateContentResponse,
} from "../../../shared/schema";

export async function generateContent({
  youtubeUrl,
  quizType,
}: {
  youtubeUrl: string;
  quizType?: string;
}): Promise<GenerateContentResponse> {
  const response = await apiRequest("POST", "/api/generate-content", {youtubeUrl, quizType});
  return response.json();
}