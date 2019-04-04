module.exports = {
  main: {
    project_name: "auto_ru",
  },
  initializers: {
    enabled: true,
    scripts: [
      "parser",
    ],
  },
  logger: {},
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
    }
  },
  constants: {},
};