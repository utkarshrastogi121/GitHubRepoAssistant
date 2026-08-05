// Generic Zod validation middleware. Validates req.body against a schema
// before the controller runs. Not a "generic base class" - just one small
// reusable function, which is fine per project rules.

import { Request, Response, NextFunction } from "express";
import { AnyZodObject } from "zod";

export function validate(schema: AnyZodObject) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: result.error.flatten().fieldErrors,
      });
    }

    req.body = result.data;
    next();
  };
}
