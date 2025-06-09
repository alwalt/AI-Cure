// cypress/plugins/index.js
import webpack from "@cypress/webpack-preprocessor";

export default (on) => {
  const options = {
    webpackOptions: {
      resolve: {
        extensions: [".ts", ".js"],
      },
      module: {
        rules: [
          {
            test: /\.ts$/,
            exclude: [/node_modules/],
            use: [
              {
                loader: "ts-loader",
                options: {
                  transpileOnly: true,
                },
              },
            ],
          },
        ],
      },
    },
  };

  on("file:preprocessor", webpack(options));
};
