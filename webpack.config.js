// webpack.config.js
module.exports = {
  entry: {
  	// traffic_light: './js/traffic_light.js',
  	map: './js/map.js'
  },
  output: {
    // filename: 'bundle.js'
    filename:'[name].js'
  }
};