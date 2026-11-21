
export const validateBody = (schema) => {
  if (!schema || typeof schema.safeParse !== "function") {
    throw new TypeError("validateBody requires a valid Zod schema.");
  }

  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed.",
        errors: result.error.issues.map((issue) => ({
          field: issue.path.length ? issue.path.join(".") : "body",
          message: issue.message,
          code: issue.code,
        })),
      });
    }

    req.body = result.data;
    next();
  };
};
