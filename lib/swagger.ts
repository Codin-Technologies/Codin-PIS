import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';

export const getApiDocs = async () => {
  const options: swaggerJsdoc.Options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'API Documentation',
        version: '1.0.0',
        description:
          'Comprehensive API documentation for Codin-PIS. Authentication uses NextAuth session cookies (JWT). ' +
          'For Try it out: open this page while logged into the app in the same browser so requests include your session cookie, ' +
          'or use Authorize → sessionCookie and paste the authjs.session-token value from DevTools → Application → Cookies.',
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
            description: 'Optional; APIs primarily use session cookies.',
          },
          sessionCookie: {
            type: 'apiKey',
            in: 'cookie',
            name: 'authjs.session-token',
            description: 'NextAuth v5 session cookie (same host as the app).',
          },
        },
      },
      security: [{ bearerAuth: [] }, { sessionCookie: [] }],
    },
    apis: [
      path.join(process.cwd(), 'app/api/**/*.ts'),
      path.join(process.cwd(), 'app/api/**/*.tsx'),
      path.join(process.cwd(), 'app/api/**/*.js'),
    ],
  };

  return swaggerJsdoc(options);
};
