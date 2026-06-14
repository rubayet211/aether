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
});
