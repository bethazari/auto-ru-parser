
const FilterWarningsPlugin = require("webpack-filter-warnings-plugin");
const withSass = require("./vendor/next-sass-fork");

module.exports = withSass({
  distDir: "build",
  useFileSystemPublicRoutes: false,
  webpackDevMiddleware: config => ({
      ...config,
      watchOptions: {
        ...config.watchOptions,
        poll: true,
      },
    }),
  webpack: (config, { dev, isServer }) => {
    config.module.rules.push(
      {
        test: /\.(svg|eot|ttf|woff|woff2)$/,
        use: {
          loader: "url-loader",
          options: {
            limit: 100000,
            outputPath: "../static/fonts",
            publicPath: "/static/fonts",
          },
        },
      },
      {
        test: /\.(png|jpg|jpeg|gif|ico)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "[name].[ext]",
              outputPath: "../static/images",
              publicPath: "/static/images",
              emitFile: !isServer,
            },
          },
          !dev && "image-webpack-loader",
        ].filter(l => l),
      },
    );

    // TODO: временная мера, направленная на блокирование в консоли браузера предупреждений о порядке импорта css-файлов
    config.plugins.push(new FilterWarningsPlugin({
      exclude: /extract-css-chunks-webpack-plugin[^]*Conflicting order between:/,
    }));

    return config;
  },
});