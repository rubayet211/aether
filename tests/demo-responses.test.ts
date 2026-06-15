import { describe, expect, it } from "vitest";
import { demoTutorResponse } from "@/lib/ai/demo-responses";

describe("demoTutorResponse", () => {
  it("detects the common misconception that motion requires a sustaining force", () => {
    const response = demoTutorResponse("I think moving means there must be a force keeping it moving.");

    expect(response.detectedMisconceptions).toContain(
      "Motion does not require a continuing net force; acceleration does.",
    );
    expect(response.message).toContain("common thought");
  });

  it("returns a hint (not a question) for the hint action", () => {
    const response = demoTutorResponse("I need a hint.", "hint");
    expect(response.message.toLowerCase()).toContain("hint");
    expect(response.message).not.toMatch(/\?$/);
  });

  it("returns an explanation for the explain action", () => {
    const response = demoTutorResponse("Please explain this concept more.", "explain");
    expect(response.message.toLowerCase()).toContain("f = ma");
  });

  it("steers to practice generation for the practice action", () => {
    const response = demoTutorResponse("Give me practice.", "practice");
    expect(response.suggestedNextAction).toBe("generate_practice");
  });

  it("produces different messages per action for the same input", () => {
    const message = demoTutorResponse("ok", "message").message;
    const hint = demoTutorResponse("ok", "hint").message;
    const explain = demoTutorResponse("ok", "explain").message;
    expect(new Set([message, hint, explain]).size).toBe(3);
  });
});
