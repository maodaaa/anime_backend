import type { Context, Next } from "hono";
import { z } from "zod";
import { generateHonoPayload } from "@helpers/honoHelpers";

export interface ValidationSchema {
    params?: z.ZodSchema<any>;
    query?: z.ZodSchema<any>;
    body?: z.ZodSchema<any>;
}

/**
 * Validation middleware for Hono that validates request parameters, query, and body
 * using Zod schemas and returns standardized error responses
 */
export function validate(schema: ValidationSchema) {
    return async (c: Context, next: Next) => {
        try {
            const validationErrors: string[] = [];

            // Validate route parameters
            if (schema.params) {
                try {
                    const params = Object.fromEntries(
                        Object.entries(c.req.param()).filter(([_, value]) => value !== undefined)
                    );
                    schema.params.parse(params);
                } catch (error) {
                    if (error instanceof z.ZodError) {
                        validationErrors.push(...error.errors.map(err =>
                            `Parameter '${err.path.join('.')}': ${err.message}`
                        ));
                    }
                }
            }

            // Validate query parameters
            if (schema.query) {
                try {
                    const query = c.req.query();
                    schema.query.parse(query);
                } catch (error) {
                    if (error instanceof z.ZodError) {
                        validationErrors.push(...error.errors.map(err =>
                            `Query parameter '${err.path.join('.')}': ${err.message}`
                        ));
                    }
                }
            }

            // Validate request body
            if (schema.body) {
                try {
                    const body = await c.req.json().catch(() => ({}));
                    schema.body.parse(body);
                } catch (error) {
                    if (error instanceof z.ZodError) {
                        validationErrors.push(...error.errors.map(err =>
                            `Body field '${err.path.join('.')}': ${err.message}`
                        ));
                    }
                }
            }

            // If there are validation errors, return 400 response
            if (validationErrors.length > 0) {
                const payload = generateHonoPayload(400, {
                    message: "Validation failed",
                    data: {
                        errors: validationErrors
                    }
                });
                return c.json(payload, 400);
            }

            await next();
        } catch (error) {
            console.error("Validation middleware error:", error);
            const payload = generateHonoPayload(500, {
                message: "Internal server error during validation"
            });
            return c.json(payload, 500);
        }
    };
}

/**
 * Helper function to create validation middleware for query parameters only
 */
export function validateQuery<T extends z.ZodSchema>(schema: T) {
    return validate({ query: schema });
}

/**
 * Helper function to create validation middleware for route parameters only
 */
export function validateParams<T extends z.ZodSchema>(schema: T) {
    return validate({ params: schema });
}

/**
 * Helper function to create validation middleware for request body only
 */
export function validateBody<T extends z.ZodSchema>(schema: T) {
    return validate({ body: schema });
}

/**
 * Helper function to create validation middleware for both params and query
 */
export function validateParamsAndQuery<P extends z.ZodSchema, Q extends z.ZodSchema>(
    paramsSchema: P,
    querySchema: Q
) {
    return validate({ params: paramsSchema, query: querySchema });
}

/**
 * Utility function to safely parse and validate data with a Zod schema
 * Returns parsed data or throws a standardized error
 */
export function safeValidate<T>(schema: z.ZodSchema<T>, data: unknown): T {
    try {
        return schema.parse(data);
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errorMessages = error.errors.map(err =>
                `${err.path.join('.')}: ${err.message}`
            );
            throw {
                status: 400,
                message: `Validation failed: ${errorMessages.join(', ')}`
            };
        }
        throw error;
    }
}

/**
 * Utility function to safely parse query parameters with transformation
 * Handles the common pattern of converting string queries to appropriate types
 */
export function parseQueryParams(c: Context, schema: z.ZodSchema) {
    const query = c.req.query();
    return safeValidate(schema, query);
}

/**
 * Utility function to safely parse route parameters
 */
export function parseRouteParams(c: Context, schema: z.ZodSchema) {
    const params = Object.fromEntries(
        Object.entries(c.req.param()).filter(([_, value]) => value !== undefined)
    );
    return safeValidate(schema, params);
}