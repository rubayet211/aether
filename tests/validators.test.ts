import { describe, expect, it } from "vitest";
import { ZodError } from "zod";
import {
  tutorRequestSchema,
  problemsRequestSchema,
  endSessionRequestSchema,
} from "@/lib/api/validators";
import { jsonError, jsonOk } from "@/lib/api/response";

describe("request validators", () => {
  it("rejects empty (whitespace-only safe) tutor messages", () => {
    expect(() => tutorRequestSchema.parse({ sessionId: "s1", userMessage: "", mode: "guided_reasoning" })).toThrow(
      ZodError,
    );
  });

  it("accepts a valid tutor request and defaults the action", () => {
    const parsed = tutorRequestSchema.parse({ sessionId: "s1", userMessage: "hi", mode: "guided_reasoning" });
    expect(parsed.action).toBe("message");
  });

  it("rejects out-of-range mastery scores", () => {
    expect(() => problemsRequestSchema.parse({ userId: "u1", masteryScore: 150 })).toThrow(ZodError);
    expect(() => problemsRequestSchema.parse({ userId: "u1", masteryScore: -5 })).toThrow(ZodError);
  });

  it("requires the explicit end flag to finalize a session", () => {
    expect(() => endSessionRequestSchema.parse({})).toThrow(ZodError);
    expect(endSessionRequestSchema.parse({ end: true })).toEqual({ end: true });
  });
});

describe("api response helpers", () => {
  it("maps ZodError to a 400 with issues", async () => {
    let caught: unknown;
    try {
      tutorRequestSchema.parse({});
    } catch (error) {
      caught = error;
    }
    const response = jsonError(caught);
    expect(response.status).toBe(400);
    const body = (await response.json()) as { ok: boolean; error: string; issues?: string[] };
    expect(body.ok).toBe(false);
    expect(Array.isArray(body.issues)).toBe(true);
  });

  it("returns a custom status for not-found style errors", async () => {
    const response = jsonError(new Error("User not found."), 404);
    expect(response.status).toBe(404);
    const body = (await response.json()) as { ok: boolean; error: string };
    expect(body.error).toBe("User not found.");
  });

  it("wraps success payloads in a consistent shape", async () => {
    const response = jsonOk({ hello: "world" });
    const body = (await response.json()) as { ok: boolean; data: { hello: string } };
    expect(body.ok).toBe(true);
    expect(body.data.hello).toBe("world");
  });
});
