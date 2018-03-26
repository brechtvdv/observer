var id_counter = 0;

class TrafficLightMarker{
    constructor(id, position){
      this.id = id;
      this.div_id = 'traffic-light-' + id_counter;
      this.counter_id = 'traffic-light-counter-' + id_counter;

      id_counter++;

      this.icon = L.divIcon({
          className: 'traffick-light-marker',
          html: '<div class="traffic-light green-light" id="' + this.div_id + '"><p id="' + this.counter_id + '"> ? </p></div>'
      });

      this.position = position;
      this.temp_color = "gray";

      this.active = false;
    }

    deactivate(){
      this.count = "?";
      this.color = "gray";

      this.active = false

      this.source.close();
    }

    activate(){
      this.source = new EventSource('https://localhost:3000?uri=' + this.id);
      this.source.onmessage = (message => {
        var data = JSON.parse(message.data)
        this.color = data.color;
        this.count = data.count;
      }).bind(this);

      this.active = true;
    }

    add_to_map(map){
        this.marker = L.marker(this.position, {
          icon: this.icon
        }).addTo(map).on('click', e => {
          if(this.active)
            this.deactivate();
          else
            this.activate();
        });

        this.traffic_light_div = document.getElementById( this.div_id );
        this.counter_p = document.getElementById( this.counter_id );

        this.color = this.temp_color;
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
}