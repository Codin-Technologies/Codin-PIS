import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';

export const getApiDocs = async () => {
  const options: swaggerJsdoc.Options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'API Documentation',
        version: '1.0.0',
        description: 'Comprehensive API documentation for Codin-PIS system. Use the authorization button to enter your access token.',
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
      security: [
        {
          bearerAuth: [],
        },
      ],
    },
    apis: [
      path.join(process.cwd(), 'app/api/**/*.ts'),
      path.join(process.cwd(), 'app/api/**/*.tsx'),
      path.join(process.cwd(), 'app/api/**/*.js'),
    ],
  };

  return swaggerJsdoc(options);
};
