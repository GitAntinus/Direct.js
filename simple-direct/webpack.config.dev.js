const webpack = require("webpack");
const path = require("path");
const HappyPack = require("happypack");
const os = require("os");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const HappyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length + 2 })

const userpath = path.resolve( "../../" );

const serverConfig = require( path.resolve( userpath , "./src/Server/Config/server" ) );

const frontendConfigPath = path.resolve( userpath , "./src/Frontend/Config" );

var protocol = serverConfig.https ? "https" : "http";
var port = serverConfig.port;

var compilerConfig = {
  mainApiHost: "127.0.0.1",
  module: {
    rules: []
  },
  devServerProxy: {},
  plugins: [],
  HtmlWebpackPluginConfig: {
    template: "./template.html"
  }
};
try {
  Object.assign( compilerConfig , require( path.resolve( userpath , "./webpack.config.js") ) );
} catch( e ){

}

module.exports = {
  entry: {
    index: path.resolve("./App")
  },
  output: {
    path: path.resolve( userpath , "./public" ),
    filename: "[name]-[hash].js",
    chunkFilename: "./static/js/[name].chunk-[chunkhash].js",
    publicPath: "/"
  },
  resolve: {
    modules: [
      "./",
      path.resolve( userpath , "./node_modules" ),
      path.resolve( userpath , "./src/" ),
      path.resolve( userpath , "./src/Frontend/" ),
    ],
    extensions: [
      ".jsx",
      ".js",
      ".css",
      ".less",
      ".png",
      ".jpg",
      ".jpeg",
      ".gif",
      ".webp"
    ]
  },
  devtool: "source-map",
  devServer: {
    contentBase: path.join( userpath , "/public" ),
    proxy: {
      "/api": {
        target: `${protocol}://${compilerConfig.mainApiHost}:${port}`,
        secure: false
      },
      "/socket.io": {
        target: `${protocol}://${compilerConfig.mainApiHost}:${port}`,
        secure: false
      },
      ...compilerConfig.devServerProxy
    },
    historyApiFallback: {
      index: "/index.html"
    },
    inline: true
  },
  module: {
    rules: [
      ...compilerConfig.module.rules,
      {
        test: /.*node_modules.*direct.*\.(jsx|js)$/,
        use: "happypack/loader?id=react"
      },
      {
        test: /\.(jsx|js)$/,
        use: "happypack/loader?id=react",
        exclude: [
          /node_modules/
        ]
      },
      {
        test: /\.less$/,
        use: "happypack/loader?id=styles"
      },
      {
        test: /\.(png|svg|webp|jpe?g|gif)/,
        use: "happypack/loader?id=images"
      }
    ]
  },
  plugins: [
    ...compilerConfig.plugins,
    new HtmlWebpackPlugin({
      ...compilerConfig.HtmlWebpackPluginConfig
    }),
    new HappyPack({
      id: "react",
      loaders: ["babel-loader?cacheDirectory"],
      threadPool: HappyThreadPool
    }),
    new HappyPack({
      id: "images",
      loaders: ["file-loader"],
      threadPool: HappyThreadPool
    }),
    new HappyPack({
      id: "styles",
      loaders: [
        "style-loader",
        {
          loader: "css-loader" ,
          options: {
            modules: true,
            minimize: true
          }
        },
        {
          loader: "less-loader",
          options: {
            paths: [
              path.resolve( userpath , "./src/Frontend/Styles/" )
            ]
          }
        }
      ],
      threadPool: HappyThreadPool
    })
  ],
  optimization: {
    splitChunks: {
      chunks: "all",
      minSize: 0,
      minChunks: 1,
      maxAsyncRequests: 6,
      maxInitialRequests: 4,
      automaticNameDelimiter: '+',
      name: true,
      cacheGroups: {
        vendor: {
          name: "vendor",
          test: /node_modules(?!\/simple-direct.*)/,
          maxInitialRequests: Infinity
        },
        config: {
          name: "directCoreConfig",
          test: /Config/,
          maxInitialRequests: Infinity
        },
        appWithDirect: {
          name: "appWithDirect",
          test: /simple-direct/,
          maxInitialRequests: Infinity
        },
        commons: {
          minSize: 30 * 1024,
          minChunks: 2
        }
      }
    }
  },
  performance: {
    hints: false
  },
  mode: "development"
};