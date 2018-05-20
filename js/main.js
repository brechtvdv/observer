var markers = [];
var test_positions = [[51.219115, 4.420655], [51.218839, 4.421601]];
var map;

const EX = 'http://example.org#';
const RDFS = 'http://www.w3.org/2000/01/rdf-schema#';
const GIS = 'http://www.opengis.net/#';
const PROV = 'http://www.w3.org/ns/prov#';

const predicates = {
  departureLane: N3.DataFactory.namedNode(EX + 'departureLane'),
  arrivalLane: N3.DataFactory.namedNode(EX + 'arrivalLane'),
  wktLiteral: N3.DataFactory.namedNode(GIS + 'geosparql/wktLiteral'),
  width: N3.DataFactory.namedNode(EX + 'width'),
  signalGroup: N3.DataFactory.namedNode(EX + 'signalGroup'),
  eventState: N3.DataFactory.namedNode(EX + 'eventstate'),
  minEndTime: N3.DataFactory.namedNode(EX + 'minendtime'),
  label: N3.DataFactory.namedNode(RDFS + 'label'),
  generatedAt: N3.DataFactory.namedNode(PROV + 'generatedAtTime')
};

$(function(){
  map = L.map('map',{
    // scrollWheelZoom : true
  // }).setView([51.2119085,4.3977947], 18);
  }).setView([51.2120345,4.3973374], 18);

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

function drawLaneOnMap(_polygon) {
  _polygon.addTo(map);
}

function drawArrowOnMap(_arrow) {
  _arrow.addTo(map);
  // _arrowHead.addTo(map);
}

function changeHtmlBodyById(_id, _body) {
  document.getElementById(_id).innerHTML = _body;
}

function retrieveQuadsFromJsonld(_jsonld) {
    return new Promise ((resolve, reject) => {
        jsonld.toRDF(_jsonld, {format: 'application/nquads'}, (err, nquads) => {
            // nquads is a string of N-Quads
            resolve(nquads);
        });
    })
}

async function getQuads(_doc) {
    if (_doc) {
        const quadsString = await retrieveQuadsFromJsonld(JSON.parse(_doc));
        const parser = new N3.Parser();
        const quads = parser.parse(quadsString);
        return quads;
    } else {
        return [];
    }
}

async function getSignalGroup(_host, _path, _signalGroup) {
    // console.log("Retrieving signalgroup data for signalgroup " + _signalGroup)
    // console.log(_host);
    // console.log(_path);
    const jsonld = await window.fetch(_host + _path, {});
    let countDown = jsonld.headers.get('cache-control');
    console.log(jsonld.headers.get('cache-control'))
    if (countDown.indexOf('max-age') != -1) {
      countDown = countDown.substring(countDown.indexOf('max-age') + 8);
      console.log(countDown);
    }
    const doc = await jsonld.text();
    const quads = await getQuads(doc);

    const store = new N3.Store();
    store.addQuads(quads);
    const eventStateQuad = store.getQuads(N3.DataFactory.namedNode(_signalGroup), predicates.eventState, null);
    const eventState = eventStateQuad[0].object.value;
    const eventStateLabel = store.getQuads(eventState, predicates.label, null)[0].object.value;
    const minEndTime = moment(store.getQuads(N3.DataFactory.namedNode(_signalGroup), predicates.minEndTime, null)[0].object.value);
    const generatedAt = moment(store.getQuads(null, predicates.generatedAt, null)[0].object.value);

    return await {
        'eventStateLabel': eventStateLabel,
        'minEndTime': minEndTime,
        'generatedAt': generatedAt,
        // 'countDown': (minEndTime.valueOf() - moment().valueOf())/1000
        'countDown': countDown
    }
}