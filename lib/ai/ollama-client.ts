export type OllamaOptions = {
  system: string;
  prompt: string;
  temperature?: number;
  model?: string;
  timeoutMs?: number;
};

export type OllamaResult =
  | { ok: true; text: string; model: string }
  | { ok: false; error: string; unavailable: boolean };

type OllamaGenerateResponse = {
  response?: string;
  model?: string;
};

const DEFAULT_TIMEOUT_MS = 45_000;
const DEFAULT_OLLAMA_CLOUD_URL = "https://ollama.com";

function buildGenerateUrl(baseUrl: string): string {
  const normalized = baseUrl.replace(/\/$/, "");
  return normalized.endsWith("/api") ? `${normalized}/generate` : `${normalized}/api/generate`;
}

export async function generateWithOllama(options: OllamaOptions): Promise<OllamaResult> {
  const apiKey = process.env.OLLAMA_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      unavailable: true,
      error: "Aether cannot reach Ollama Cloud. Set OLLAMA_API_KEY and verify your cloud model configuration.",
    };
  }

  const baseUrl = process.env.OLLAMA_BASE_URL ?? DEFAULT_OLLAMA_CLOUD_URL;
  const primaryModel = options.model ?? process.env.OLLAMA_MODEL ?? "gpt-oss:120b";
  const fallbackModel = process.env.OLLAMA_FALLBACK_MODEL;
  const models = fallbackModel && fallbackModel !== primaryModel ? [primaryModel, fallbackModel] : [primaryModel];
  const generateUrl = buildGenerateUrl(baseUrl);

  for (const model of models) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? DEFAULT_TIMEOUT_MS);

    try {
      const response = await fetch(generateUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          system: options.system,
          prompt: options.prompt,
          stream: false,
          options: {
            temperature: options.temperature ?? 0.4,
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) continue;
      const json = (await response.json()) as OllamaGenerateResponse;
      if (json.response) return { ok: true, text: json.response, model: json.model ?? model };
    } catch {
      clearTimeout(timeout);
    }
  }

  return {
    ok: false,
    unavailable: true,
    error: "Aether cannot reach Ollama Cloud. Check OLLAMA_API_KEY, OLLAMA_BASE_URL, and OLLAMA_MODEL.",
  };
}
