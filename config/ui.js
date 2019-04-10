
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
    nextjs: {
      enabled: true,
    },
    routing() {

      this.server.use("/static/images", express.static(`${path.resolve(".")}/cdn/images`));

      // api routes
      this.addRoute("get", "/api/brands", "api", "getBrands");
      this.addRoute("get", "/api/models", "api", "getModels");
      this.addRoute("get", "/api/generations", "api", "getGenerations");
      this.addRoute("get", "/api/stats", "api", "getStats");
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