import { useState } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";

export default function Revision() {
  const [videoId, setVideoId] = useState("");
  const [type, setType] = useState<"quiz" | "flashcards">("quiz");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setResult(null);
    const transcriptRes = await fetch(
      `/api/youtube/transcript?videoId=${videoId}`
    );
    const transcriptData = await transcriptRes.json();
    if (!transcriptData.transcript) {
      setResult("No transcript found for this video.");
      setLoading(false);
      return;
    }
    const revisionRes = await fetch("/api/revision/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript: transcriptData.transcript, type }),
    });
    const { result } = await revisionRes.json();
    setResult(result);
    setLoading(false);
  };

  return (
    <div>
      <Header />
      <main className="max-w-xl mx-auto py-12">
        <h1 className="text-3xl font-bold mb-6">Revision</h1>
        <div className="mb-4">
          <input
            className="border px-3 py-2 rounded w-full mb-2"
            placeholder="Paste YouTube Video ID"
            value={videoId}
            onChange={(e) => setVideoId(e.target.value)}
          />
          <div className="flex gap-4 mb-2">
            <Button
              variant={type === "quiz" ? "default" : "outline"}
              onClick={() => setType("quiz")}
            >
              Quiz
            </Button>
            <Button
              variant={type === "flashcards" ? "default" : "outline"}
              onClick={() => setType("flashcards")}
            >
              Memory Cards
            </Button>
          </div>
          <Button onClick={handleGenerate} disabled={!videoId || loading}>
            {loading ? "Generating..." : "Generate"}
          </Button>
        </div>
        {result && (
          <pre className="bg-muted p-4 rounded whitespace-pre-wrap mt-4">
            {result}
          </pre>
        )}
      </main>
    </div>
  );
}
