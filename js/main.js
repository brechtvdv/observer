var color =  "green-light";
var counter = 3;
var marker_test;

$(function(){
  var map = L.map('map',{
    scrollWheelZoom : false
  }).setView([51.219008, 4.421053], 19);

  //Add tile layer from Mapbox
  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoibGFtYXNhdXJ1cyIsImEiOiJjamV5ZTYyZjUxNWYzMndwdWQ0YTBrZWJhIn0.c7Mb44YmSAV6R-c2BeuOiA'
  }).addTo(map);

  var icon_test = L.divIcon({
      className: 'traffic-light green-light',
      html: '<p>3</p>'
  });

  marker_test = L.marker([51.219008, 4.421053], {
    icon: icon_test
  }).addTo(map);

  setInterval(function(){

    counter--;

    if(counter < 1){
      counter = 3
      if(marker_test._icon.classList.contains("green-light")){
        marker_test._icon.classList.remove("green-light");
        marker_test._icon.classList.add("orange-light");
      } else if(marker_test._icon.classList.contains("orange-light")){
        marker_test._icon.classList.remove("orange-light");
        marker_test._icon.classList.add("red-light");
      } else if(marker_test._icon.classList.contains("red-light")){
        marker_test._icon.classList.remove("red-light");
        marker_test._icon.classList.add("green-light");
      }
    }

    marker_test._icon.innerHTML = '<p>' + counter + '</p>';

  }, 1000)
});
