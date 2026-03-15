import swaggerJsdoc from 'swagger-jsdoc';

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
      './app/api/**/*.ts', 
      './app/api/**/*.tsx'
    ],
  };

  return swaggerJsdoc(options);
};
