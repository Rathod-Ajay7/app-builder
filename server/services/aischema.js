import { z } from "zod";

export const generatingresultschema = z.object({
    files: z.record(z.string(), z.string()),
    description: z.string().default('generated project'),
});

export const fileopschema = z.object({
    op: z.enum(["create", "update", "delete"]),
    path: z.string(),
    content: z.string().nullable().optional(),
    search: z.string().nullable().optional(),
    replace: z.string().nullable().optional(),
});

export const revisionresultschema = z.object({
    operations: z.array(fileopschema),
    description: z.string().default('revised project'),
});

export const fileplanschema = z.object({
    files: z.array(z.object({
        path: z.string(),
        description: z.string(),
        exports: z.string().optional().default(""),
        imports: z.array(z.string()).optional().default([]),
    })),
    projectname: z.string().default("generated project"),
    projectdescription: z.string().default("A react project"),
    currentfile: z.string().nullable().optional(),
});

export const filecodeschema = z.object({
    code: z.string(),
});
