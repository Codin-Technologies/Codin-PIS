/**
 * Pre-generates the OpenAPI/Swagger spec and writes it to public/openapi.json.
 * This script is run during `next build` so that Vercel's serverless functions
 * can serve a static spec instead of scanning source files at runtime
 * (source .ts files are not included in serverless deployment bundles).
 *
 * Usage: node scripts/generate-swagger.mjs
 */

import swaggerJsdoc from 'swagger-jsdoc';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      version: '1.0.0',
      description:
        'Comprehensive API documentation for Codin-PIS system. Use the authorization button to enter your access token.',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Local Development Server',
      },
      {
        url: 'https://codin-pis-yetb.vercel.app',
        description: 'Production Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [
    join(projectRoot, 'app/api/**/*.ts'),
    join(projectRoot, 'app/api/**/*.tsx'),
    join(projectRoot, 'app/api/**/*.js'),
  ],
};

const spec = swaggerJsdoc(options);

// Write to public/ so it is served as a static asset by Next.js
const outputDir = join(projectRoot, 'public');
mkdirSync(outputDir, { recursive: true });
const outputPath = join(outputDir, 'openapi.json');
writeFileSync(outputPath, JSON.stringify(spec, null, 2), 'utf-8');

console.log(`✅ OpenAPI spec written to ${outputPath}`);
