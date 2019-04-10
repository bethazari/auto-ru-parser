// Реализация форка взята из https://github.com/zeit/next-plugins/pull/190/files

const cssLoaderConfig = require("./css-loader-config-fork");

module.exports = (nextConfig = {}) => Object.assign({}, nextConfig, {
  webpack(config, options) {
    if (!options.defaultLoaders) {
      throw new Error(
        "This plugin is not compatible with Next.js versions below 5.0.0 https://err.sh/next-plugins/upgrade",
      );
    }

    const { dev, isServer } = options;
    const {
      cssModules,
      cssLoaderOptions,
      postcssLoaderOptions,
      sassLoaderOptions = {},
    } = nextConfig;

    // eslint-disable-next-line no-param-reassign
    options.defaultLoaders.sass = cssLoaderConfig(config, {
      extensions: ["scss", "sass"],
      cssModules,
      cssLoaderOptions,
      postcssLoaderOptions,
      dev,
      isServer,
      loaders: [
        {
          loader: "sass-loader",
          options: sassLoaderOptions,
        },
      ],
    });

    config.module.rules.push(
      {
        test: /\.scss$/,
        use: options.defaultLoaders.sass,
      },
      {
        test: /\.sass$/,
        use: options.defaultLoaders.sass,
      },
    );

    if (typeof nextConfig.webpack === "function") {
      return nextConfig.webpack(config, options);
    }

    return config;
  },
});
