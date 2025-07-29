import swaggerAutogen from "swagger-autogen";

const doc = {
  info: {
    version: "0.0.1",
    title: "ACP API Documentation",
    description: "Dokumentassi API untuk project ACP (WEB Raffles ACP)",
  },

  servers: [
    {
      url: "http://localhost:3000/api",
      description: "Local Server",
    },
    {
      url: "https://acp-rafle-be.vercel.app/api",
      description: "Deploy Server",
    },
  ],

  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
      },
    },

    schemas: {
      LoginRequest: {
        identifier: "mulyadiarman",
        password: "repom123gkjelas",
      },
    },
  },
};

const outputFile = "./swagger_output.json";
const endpointsFiles = ["../routes/api.ts"];

// Generate swagger.json
swaggerAutogen({ openapi: "3.0.0" })(outputFile, endpointsFiles, doc).then(
  async () => {
    // Pesan sukses setelah file berhasil dibuat
    console.log("Dokumentasi Swagger berhasil dibuat: " + outputFile);
  }
);
