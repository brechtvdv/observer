var fetch = require('node-fetch'),
  N3 = require('n3'),
  wktParser = require('wellknown');

const EX = 'http://example.org#';
const RDFS = 'http://www.w3.org/2000/01/rdf-schema#';
const GIS = 'http://www.opengis.net/#';

const predicates = {
  departureLane: N3.DataFactory.namedNode(EX + 'departureLane'),
  arrivalLane: N3.DataFactory.namedNode(EX + 'arrivalLane'),
  wktLiteral: N3.DataFactory.namedNode(GIS + 'geosparql/wktLiteral'),
  width: N3.DataFactory.namedNode(EX + 'width')
};
const literals = {
  // yo: N3.DataFactory.literal('Yo', 'en'),
};
const objects = {
  connection: N3.DataFactory.namedNode(EX + 'Connection'),
};

function parseTurtle(document) {
  return new Promise(resolve => {
    let quads = [];
    const parser = new N3.Parser();
    parser.parse(document, (error, quad, prefixes) => {
      if (quad) {
        // console.log(quad);
        quads.push(quad);
      } else {
        // console.log("# That's all, folks!", prefixes);
        resolve(quads)
      }
    })
  })
}
async function getQuadsFromUrl(_url) {
  let document = await fetch(_url, {
        headers: { 'Accept': 'text/turtle' },
      });
  let documentText = await document.text();

  return await parseTurtle(documentText);
}

function calcSlopePerpendicular(_pointA, _pointB) {
  return -((_pointA[0] - _pointB[0]) / (_pointA[1] - _pointB[1]));
}

function calcT(_height, _slope) {
  return _height / Math.sqrt(1+Math.pow(_slope, 2));
}

function calcNewCoordinates(_point, _t, _slope) {
  return [ _point[0] + _t, _point[1] + _slope*_t ]
}

function calcLanePolygon(_wktLiteral, _width) {
  let height = _width / 2 / 10000000; // polygon is made out of 2 lines parallel half the width from the middle line
  let geoJSON = wktParser(_wktLiteral);
  if (geoJSON) {
    // Calculate line parallel
    const slope = calcSlopePerpendicular(geoJSON.coordinates[0], geoJSON.coordinates[1]);
    const t = calcT(height, slope);
    const min_t = calcT(-height, slope);

    const c1 = calcNewCoordinates(geoJSON.coordinates[0], t, slope);
    const c2 = calcNewCoordinates(geoJSON.coordinates[1], t, slope);
    const c3 = calcNewCoordinates(geoJSON.coordinates[0], min_t, slope);
    const c4 = calcNewCoordinates(geoJSON.coordinates[1], min_t, slope);

    return [c1, c3, c4, c2];
  }
}

var mapdataUrl = 'https://raw.githubusercontent.com/brechtvdv/map2lrc/master/example.ttl?token=AF5zkPu7sqecc5zPoO5gnmv6Qzou1IP1ks5a_AklwA%3D%3D';

getQuadsFromUrl(mapdataUrl).then((quads) => {
  // console.log(quads);
  // Store the parsed quads into a store, so we can search them
  const store = new N3.Store();
  store.addQuads(quads);

  // Search for all connections
  const connections = store.getQuads(null,null, objects.connection);

  connections.forEach(connection => {
    // Search for departure and arrival lane of that connection
    const departureLaneQuad = store.getQuads(connection.subject, predicates.departureLane, null);
    const arrivalLaneQuad = store.getQuads(connection.subject, predicates.arrivalLane, null);

    // A connection should have exactly one departure and one arrival lane
    if (departureLaneQuad.length === 1 && arrivalLaneQuad.length === 1) {
      // Calculate and draw departure lane
      const departureWktLiteralQuad = store.getQuads(departureLaneQuad[0].object, predicates.wktLiteral, null);
      const departureWidthQuad = store.getQuads(departureLaneQuad[0].object, predicates.width, null);

      let departureLanePolygon;
      if (departureWktLiteralQuad.length === 1 && departureWidthQuad.length === 1) {
        departureLanePolygon = calcLanePolygon(departureWktLiteralQuad[0].object.value, departureWidthQuad[0].object.value);
        drawLaneOnMap(departureLanePolygon, 'yellow');
      }

      // Calculate and draw arrival lane
      const arrivalWktLiteralQuad = store.getQuads(arrivalLaneQuad[0].object, predicates.wktLiteral, null);
      const arrivalWidthQuad = store.getQuads(arrivalLaneQuad[0].object, predicates.width, null);

      let arrivalLanePolygon;
      if (arrivalWktLiteralQuad.length === 1 && arrivalWidthQuad.length === 1) {
        arrivalLanePolygon = calcLanePolygon(arrivalWktLiteralQuad[0].object.value, arrivalWidthQuad[0].object.value);
        drawLaneOnMap(arrivalLanePolygon, 'red');
      }

      // Draw connection with arrow between departure and arrival lane
      if (departureLanePolygon && arrivalLanePolygon) {
        drawArrowOnMap(departureLanePolygon, arrivalLanePolygon);
      }
    }
  })
});