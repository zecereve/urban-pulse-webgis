const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Urban Pulse Web-GIS API",
            version: "1.0.0",
            description: "API documentation for the Urban Pulse Web-GIS application. Manages locations, users, and citizen feedback.",
        },
        servers: [
            {
                url: "http://51.20.188.13:5050/api",
                description: "Production Server (AWS)",
            },
            {
                url: "http://localhost:5050/api",
                description: "Local Development Server",
            },
        ],
        components: {
            securitySchemes: {
                // Simple example if we had JWT
                // bearerAuth: {
                //   type: "http",
                //   scheme: "bearer",
                //   bearerFormat: "JWT",
                // },
            },
        },
    },
    apis: ["./src/routes/*.js"], // Route dosyalarındaki yorumları okuyacak
};

const specs = swaggerJsdoc(options);

function swaggerDocs(app, port) {
    // Swagger sayfasını sun
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

    // JSON formatında dokümanı sun (Postman'e import için)
    app.get("/api-docs.json", (req, res) => {
        res.setHeader("Content-Type", "application/json");
        res.send(specs);
    });

    console.log(`📄 Swagger Docs available at http://localhost:${port}/api-docs`);
}

module.exports = swaggerDocs;
