var markers = [];
var test_positions = [[51.219115, 4.420655], [51.218839, 4.421601]];
var map;

$(function(){
  map = L.map('map',{
    // scrollWheelZoom : true
  }).setView([51.2119085,4.3977947], 18);

  // Add tile layer from Mapbox
  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 20,
    maxNativeZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoibGFtYXNhdXJ1cyIsImEiOiJjamV5ZTYyZjUxNWYzMndwdWQ0YTBrZWJhIn0.c7Mb44YmSAV6R-c2BeuOiA'
  }).addTo(map);  

  // L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  //   attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  //   maxZoom: 20,
  //   maxNativeZoom: 18
  // }).addTo(map);
});

function drawLaneOnMap(_coordinates, _color) {
  var polygon = L.polygon(_coordinates, {color: _color, weight: 1, fill: true, fillOpacity: 1}).addTo(map);
}

function drawArrowOnMap(_polygonA, _polygonB) {
  var arrow = L.polyline([_polygonA[0], _polygonB[0]], {}).addTo(map);
  var arrowHead = L.polylineDecorator(arrow, {
      patterns: [
          {offset: '100%', repeat: 0, symbol: L.Symbol.arrowHead({pixelSize: 15, polygon: false, pathOptions: {stroke: true}})}
      ]
  }).addTo(map);
}