const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: { title: 'MathQuiz API', version: '1.0.0' },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    servers: [
      {
        url: 'http://localhost:11000',
        description: 'Fejlesztői szerver',
      },
    ],
    security: [{ bearerAuth: [] }]
  },
  apis: ['./routes/*.js'], // ahol a Swagger kommentek vannak
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
