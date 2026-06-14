import { ZodError } from "zod";

export type ApiSuccess<T> = {
  ok: true;
  data: T;
};

export type ApiFailure = {
  ok: false;
  error: string;
  issues?: string[];
};

export function jsonOk<T>(data: T, init?: ResponseInit): Response {
  return Response.json({ ok: true, data } satisfies ApiSuccess<T>, init);
}

export function jsonError(error: unknown, status = 500): Response {
  if (error instanceof ZodError) {
    return Response.json(
      {
        ok: false,
        error: "Invalid request.",
        issues: error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`),
      } satisfies ApiFailure,
      { status: 400 },
    );
  }

  const message = error instanceof Error ? error.message : "Something went wrong.";
  return Response.json({ ok: false, error: message } satisfies ApiFailure, { status });
}
