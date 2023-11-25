const path = require('path');
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = (env = {}, argv = {}) => ({
  entry: path.resolve(__dirname, 'src/index.tsx'),
  devtool: 'inline-source-map',
  resolve: {
    extensions: [ '.tsx', '.ts', '.js', '.sass' ],
    modules: ['src', 'node_modules'],
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: argv.mode === 'development' ? '/' : '',
    chunkFilename: '[name].bundle.js',
    crossOriginLoading: 'anonymous',
  },
  module: {
    rules: [
        {
            test: /\.(js)$/, // .js
            use: {
                loader: "babel-loader",
                options: {
                    presets: ['@babel/preset-env', '@babel/preset-react']
                }
            },  
            exclude: /node_modules/, // excluding the node_modules folder
        },
        {
            test: /\.tsx?$/,
            use: 'ts-loader',
            exclude: /node_modules/,
        },
        {
            test: /\.sass$/, // styles files
            use: [
                'style-loader',
                {
                  loader: 'css-loader',
                  options: {
                    sourceMap: true,
                    modules: {
                      localIdentName: '[local]'
                    }
                  }
                },
                {
                  loader: 'sass-loader',
                  options: {
                    sourceMap: true
                  }
                }
            ],
        },
        {
            test: /\.(png|woff|woff2|eot|ttf|svg)$/, // to import images and fonts
            loader: "url-loader",
            options: { limit: false },
        },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname , 'src/index.html')
    })
  ]
});