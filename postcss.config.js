const path = require("path");

module.exports = (ctx) => {
  const dev = ctx.env === "development";

  return {
    map: dev ? ctx.map : false,
    plugins: {
      "postcss-font-magician": {
        hosted: [path.join(process.cwd("."), "src", "fonts"), "/static/fonts"],
        formats: "local woff2 woff ttf eot svg otf",
      },
      cssnano: dev ? false : { preset: "cssnano-preset-advanced" },
      autoprefixer: {
        ...ctx.options.autoprefixer,
        browsers: [
          "> 1%",
          "last 4 version",
          "ie >= 9",
          "not dead",
        ],
      },
    },
  };
};