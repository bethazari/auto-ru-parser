
const express = require("express");
const path = require("path");


module.exports = {
  initializers: {},
  logger: {},
  main: {
    project_name: "ui",
  },
  web_server: {
    address: "0.0.0.0",
    enabled: true,
    port: 80,
    routing() {

      this.server.use("/static/images", express.static(`${path.resolve(".")}/cdn/images`));

      // api routes
      // this.addRoute("post", "/api/download", "api", "sendDownloadStatistics");
    },
  },
  mongo: {
    enabled: true,
    connections: {
      main: {
        host: "mongo",
        port: 27017,
        name: "auto_ru",
      },
    },
  },
  redis: {
    enabled: true,
    connections: {
      main: {
        host: "redis",
      },
    },
  },
  constants: {

  },
};