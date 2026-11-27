import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { HttpError } from "./security";

export const json = (value: unknown, status = 200) =>
  NextResponse.json(value, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });
export function failure(error: unknown) {
  if (error instanceof HttpError)
    return json({ error: error.message }, error.status);
  if (error instanceof ZodError)
    return json(
      {
        error: "Revisa los campos indicados.",
        fields: error.issues.map((i) => ({
          field: i.path.join("."),
          message: i.message,
        })),
      },
      400,
    );
  return json(
    {
      error:
        "No se pudo completar la operación. Tus datos guardados se conservan.",
    },
    500,
  );
}
