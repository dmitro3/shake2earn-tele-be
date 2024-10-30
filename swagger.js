const options = {
  openapi: "OpenAPI 3",
  language: "en-US",
  disableLogs: false,
  autoHeaders: false,
  autoQuery: false,
  autoBody: false,
};
import generateSwagger from "swagger-autogen";

const swaggerDocument = {
  info: {
    version: "1.0.0",
    title: "Shake2earn Apis",
    description: "API for Managing shake2earn calls",
    contact: {
      name: "API Support",
      email: "blockey001@gmail.com",
    },
  },
  host: "localhost:3001",
  basePath: "/",
  schemes: ["http"],
  consumes: ["application/json"],
  produces: ["application/json"],
  tags: [
    {
      name: "SHAKE2EARN CRUD",
      description: "SHAKE2EARN related apis",
    },
    {
      name: "Shake2earn",
      description: "Shake2earn App",
    },
  ],
  securityDefinitions: {},
  definitions: {
    shake2earnResponse: {
      code: 200,
      message: "Success",
    },
    "errorResponse.400": {
      code: 400,
      message:
        "The request was malformed or invalid. Please check the request parameters.",
    },
    "errorResponse.401": {
      code: 401,
      message: "Authentication failed or user lacks proper authorization.",
    },
    "errorResponse.403": {
      code: 403,
      message: "You do not have permission to access this resource.",
    },
    "errorResponse.404": {
      code: "404",
      message: "The requested resource could not be found on the server.",
    },
    "errorResponse.500": {
      code: 500,
      message:
        "An unexpected error occurred on the server. Please try again later.",
    },
  },
};
const swaggerFile = "./docs/swagger.json";
const apiRouteFile = ["./src/index.js"];
generateSwagger(swaggerFile, apiRouteFile, swaggerDocument);
