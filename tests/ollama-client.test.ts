import { afterEach, describe, expect, it, vi } from "vitest";
import { generateWithOllama } from "@/lib/ai/ollama-client";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
  vi.restoreAllMocks();
});

describe("generateWithOllama", () => {
  it("requires an Ollama Cloud API key before making a request", async () => {
    delete process.env.OLLAMA_API_KEY;
    process.env.OLLAMA_MODEL = "gpt-oss:120b";
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const result = await generateWithOllama({
      system: "system",
      prompt: "prompt",
    });

    expect(result.ok).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("calls Ollama Cloud with Bearer authentication", async () => {
    process.env.OLLAMA_API_KEY = "test-key";
    process.env.OLLAMA_BASE_URL = "https://ollama.com";
    process.env.OLLAMA_MODEL = "gpt-oss:120b";
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json({
          model: "gpt-oss:120b",
          response: "{\"message\":\"ok\"}",
        }),
      ),
    );

    const result = await generateWithOllama({
      system: "system",
      prompt: "prompt",
    });

    expect(result.ok).toBe(true);
    expect(fetch).toHaveBeenCalledWith(
      "https://ollama.com/api/generate",
      expect.objectContaining({
        headers: {
          Authorization: "Bearer test-key",
          "Content-Type": "application/json",
        },
      }),
    );
  });
});
