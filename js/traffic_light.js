const data_source = 'lodi.ilabt.imec.be';

class TrafficLightMarker{
    constructor(uri, position){
      this.uri = uri;
      this.active = false;
      this.counter = 0;
      this.redStyle = {
                'weight': 5,
                'color': 'red',
                'fillColor': 'red'
            }; 
       this.orangeStyle = {
          'weight': 5,
          'color': 'orange',
          'fillColor': 'orange'
      };  
      this.greenStyle = {
          'weight': 5,
          'color': 'green',
          'fillColor': 'green'
      };

      this.marker = L.polyline(position, {});
      // .on('click', e => {
      //    if(this.active)
      //       this.deactivate();
      //     else
      //       this.activate();
      //   });

      this.activate();
      
      this.markerHead = L.polylineDecorator(this.marker, {
      patterns: [
          {offset: '100%', repeat: 0, symbol: L.Symbol.arrowHead({pixelSize: 20, polygon: false, pathOptions: {stroke: true}})}
      ]});

      // this.host = "https://localhost:3000";
      this.host = "https://" + data_source + ":3002";
      this.path = "/?uri=" + this.uri;
      this.retrieveUrl = this.host + this.path;

      this.data = {};
    }

    deactivate(){
      this.active = false;
      this.counter = 0;
      this.source.close();

      changeHtmlBodyById('on_update_connection', '');

      changeHtmlBodyById('on_click_connection', '<p>You deactivated connection influenced by signalgroup <a href="' 
               + this.retrieveUrl
               + '">'
               + this.uri
               + '</a></p>');
      }

    activate(){
      this.active = true;
      this.counter = 0;

      this.source = new EventSource('https://' + data_source + ':3002/');

      this.source.onerror = (error => { 
        // console.log("error");
        changeHtmlBodyById('traffic_light', '<p style="font-size: 20px;">No data can be retrieved.</p>');
      })

      this.source.onmessage = (event) => {
        // console.log(JSON.parse(event.data));
        let data = JSON.parse(event.data);

        // Only update selected connection
        if(data['@graph'][0]['@id'] === this.uri) {
          // console.log(data)
          const label = data['@graph'][0]['eventState']['rdfs:label'];
          const generatedAt = moment(data['generatedAt']);
          const minEndTime = moment(data['@graph'][0]['minEndTime']);
          const count = Math.round((minEndTime.valueOf() - generatedAt.valueOf())/1000);

          this.showCounterLabel(count, label);
        }
      };

      // this.showCounter();

     changeHtmlBodyById('on_click_connection', '<p>Below you can see a visualization of the traffic light status between the Volkstraat and the Nationalestraat.</p>');
      // <a href="' 
      //        + this.retrieveUrl
      //        + '">' 
      //        + this.uri
      //        + '</a></p>');
    }

    set count(number){
      this.counter_p.innerHTML = number;
    }

    set color(hex){
      console.log(hex);
      this.traffic_light_div.style.backgroundColor = hex;
    }

    get color(){
      return this.traffic_light_div.style.backgroundColor;
    }

    // async loadData() {
    //   this.data = await getSignalGroup(this.host, this.path, this.uri);
    //   this.counter = this.data.countDown;
    // }

    // async showCounter() {
    //   while (this.active) {
    //     // Let browser handle cache
    //     if (this.counter < 0) {
    //       await this.loadData();
    //     }
        
    //     changeHtmlBodyById('on_update_connection', '<p>State: ' + this.data.eventStateLabel + '\nCounter: ' + this.counter + '</p>');
    //     if (this.data.eventStateLabel === 'stop-Then-Proceed' || this.data.eventStateLabel === 'stop-And-Remain') {
    //       // Red
    //       changeHtmlBodyById('traffic_light', '<img src="./assets/images/red.jpg" height="100" width="100"/>');
    //       this.marker.setStyle(this.redStyle);
    //     }
    //     else if (this.data.eventStateLabel === 'permissive-Movement-Allowed' || this.data.eventStateLabel === 'protected-Movement-Allowed') {
    //       // green
    //       changeHtmlBodyById('traffic_light', '<img href="./assets/images/green.jpg" height="100" width="100"/>');
    //       this.marker.setStyle(this.greenStyle);
    //     }
    //     else if (this.data.eventStateLabel === 'unavailable') {
    //       changeHtmlBodyById('traffic_light', '<img href="./assets/images/orange.jpg" height="100" width="100"/>');
    //       this.marker.setStyle(this.orangeStyle);
    //     }
    //     await sleep(1000);
    //     this.counter--;
    //  }
    // }

    async showCounterLabel(counter_, label_) {
      const info = '<h3 style="float: left; padding: 60px; position: relative; left: 60px; font-size: 70px; margin-top: 10px;">' + counter_ + "</h3>"
              + '<h3 style="text-align: center; position: relative; bottom: 90px;">' + label_ + "</h3>";
      // const info = '<h3 style="float: left">' + label_ + '</h3><h1 style="font-size: 100px;">' + counter_ + '</h1></div>';
      if (label_ === 'stop-Then-Proceed' || label_ === 'stop-And-Remain') {
        // Red
        changeHtmlBodyById('traffic_light', '<img src="./assets/images/red.jpg" height="40%" width="40%" style="float: left; margin-top: 50px;"/>' + info);
        this.marker.setStyle(this.redStyle);
      }
      else if (label_ === 'permissive-Movement-Allowed' || label_ === 'protected-Movement-Allowed') {
        // green
        changeHtmlBodyById('traffic_light', '<img src="./assets/images/green.jpg" height="40%" width="40%" style="float: left; margin-top: 50px;"/>' + info);
        this.marker.setStyle(this.greenStyle);
      }
      else if (label_ === 'unavailable') {
        changeHtmlBodyById('traffic_light', '<img src="./assets/images/orange.jpg" height="40%" width="40%" style="float: left; margin-top: 50px;"/>' + info);
        this.marker.setStyle(this.orangeStyle);
      }
    }
  }

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}