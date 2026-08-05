
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "AI GitHub Repository Assistant API",
      version: "1.0.0",
      description: "Backend API for analyzing GitHub repositories with AI (RAG, README/diagram generation, code review).",
    },
    servers: [{ url: "/api" }],
  },
  apis: ["./src/routes/*.ts"],
});

export function mountSwagger(app: Express) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
