module.exports = {
  head: {
    title: 'Open IoT Dash',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'A self-hosted, open-source IoT dashboard' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'stylesheet', href: '//fonts.googleapis.com/icon?family=Material+Icons' },
    ],
  },
  /*
  ** Global CSS
  */
  css: ['~assets/css/main.css'],
  /*
  ** Add axios globally
  */
  build: {
    loaders: [
      {
        test: /\.(png|jpe?g|gif|svg)$/,
        loader: 'url-loader',
        query: {
          limit: 500000,
          name: 'img/[name].[hash].[ext]'
        }
      },
      {
        test: /\.scss$/,
        loader: 'sass-loader',
      }
    ],
    vendor: ['axios'],
    extend (config, ctx) {
      if (ctx.isClient) {
        // removed linter.
      }
    }
  },
  env: {
    WS_URL: process.env.WS_URL || 'http://localhost:3000',
  },
}
