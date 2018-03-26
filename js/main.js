var markers = [];
var test_positions = [[51.219115, 4.420655], [51.218839, 4.421601]];

$(function(){
  var map = L.map('map',{
    scrollWheelZoom : false
  }).setView([51.219008, 4.421053], 17);

  //Add tile layer from Mapbox
  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 17,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoibGFtYXNhdXJ1cyIsImEiOiJjamV5ZTYyZjUxNWYzMndwdWQ0YTBrZWJhIn0.c7Mb44YmSAV6R-c2BeuOiA'
  }).addTo(map);

  var xmlHttp = new XMLHttpRequest();

  xmlHttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      var catalog = JSON.parse(this.responseText);
      for (var sensor of catalog["@graph"]){
        var new_marker = new TrafficLightMarker(sensor["@id"], [sensor.latitude, sensor.longitude]);
        markers.push(new_marker);
        new_marker.add_to_map(map);
      }
    }
  };

  xmlHttp.open( "GET", 'https://localhost:3000', false ); // false for synchronous request
  xmlHttp.send( null );

  /*var source1 = new EventSource('https://localhost:3000?uri=' + 'http://data.observer.be/verkeerslichten/1');
  source1.onmessage = function(message) {
    data = JSON.parse(message.data)

    if(!markers){

      //Initiate a marker for every traffic light
      markers = [];
      for( var light of data["@graph"] ){
        new_marker = new TrafficLightMarker(light["@id"], light.count, test_positions.pop(), light.color);
        markers.push(new_marker);
        new_marker.add_to_map(map);
      }

    } else {

      //Update every traffic light
      for( var light of data["@graph"] ){
        for( var marker of markers ){
          if( marker.id == light["@id"] ){

            marker.color = light.color;
            marker.count = light.count;

          }
        }
      }

    }
  };*/
});