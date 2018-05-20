const http2 = require('http2');
const fs = require('fs');
const jsonld = require('jsonld');
const N3 = require('n3');
const moment = require('moment');

const EX = 'http://example.org#';
const RDFS = 'http://www.w3.org/2000/01/rdf-schema#';
const GIS = 'http://www.opengis.net/#';

const predicates = {
  departureLane: N3.DataFactory.namedNode(EX + 'departureLane'),
  arrivalLane: N3.DataFactory.namedNode(EX + 'arrivalLane'),
  wktLiteral: N3.DataFactory.namedNode(GIS + 'geosparql/wktLiteral'),
  width: N3.DataFactory.namedNode(EX + 'width'),
  signalGroup: N3.DataFactory.namedNode(EX + 'signalGroup'),
  eventState: N3.DataFactory.namedNode(EX + 'eventstate'),
  minEndTime: N3.DataFactory.namedNode(EX + 'minendtime'),
  label: N3.DataFactory.namedNode(RDFS + 'label'),
  generatedAt: N3.DataFactory.namedNode()
};
const literals = {
  // yo: N3.DataFactory.literal('Yo', 'en'),
};
const objects = {
  connection: N3.DataFactory.namedNode(EX + 'Connection'),
};

function getClient(_host) {
	// We can close the connection to the server when we want
	let client = http2.connect(_host, {
		  ca: fs.readFileSync('./js/localhost-cert.pem')
		});
	client.on('error', (err) => {console.error(err);});

	return client;
}

function retrieveDocument(_client, _path) {
	return new Promise ((resolve, reject) => {
		const req = _client.request({ ':path': _path });

		req.on('response', (headers, flags) => {
		  for (const name in headers) {
		    // console.log(`${name}: ${headers[name]}`);
		  }
		});

		req.setEncoding('utf8');
		let data = '';
		req.on('data', (chunk) => { data += chunk; });
		req.on('end', () => {
		  resolve(data);
		});
		req.end();
	});
}

function retrieveQuadsFromJsonld(_jsonld) {
	return new Promise ((resolve, reject) => {
		jsonld.toRDF(_jsonld, {format: 'application/n-quads'}, (err, nquads) => {
	  		// nquads is a string of N-Quads
	  		resolve(nquads);
		});
	})
}

async function getQuads(_client, _path) {
	const doc = await retrieveDocument(_client, _path);
	if (doc) {
		const quadsString = await retrieveQuadsFromJsonld(JSON.parse(doc));
		const parser = new N3.Parser();
		const quads = parser.parse(quadsString);
		return quads;
	} else {
		return [];
	}
}

async function getSignalGroup(_client, _signalGroup) {
	debugger;
	const quads = await getQuads(_client, "/?uri=" + _signalGroup)
	const store = new N3.Store();
	store.addQuads(quads);
	// console.log(quads)

    const eventStateQuad = store.getQuads(N3.DataFactory.namedNode(_signalGroup), predicates.eventState, null);
    const eventState = eventStateQuad[0].object.value;
    const eventStateLabel = store.getQuads(eventState, predicates.label, null)[0].object.value;
    const minEndTime = moment(store.getQuads(N3.DataFactory.namedNode(_signalGroup), predicates.minEndTime, null)[0].object.value);
    const generatedAt = moment(store.getQuads(N3.DataFactory.namedNode(_signalGroup), predicates.minEndTime, null)[0].object.value);
	console.log(minEndTime);
    return await {
    	'eventStateLabel': eventStateLabel,
    	'minEndTime': minEndTime,
    	// Use this later:
    	// 'countDown': (minEndTime.valueOf() - moment().valueOf())/1000
    	'countDown': (minEndTime.valueOf() - .valueOf())/1000
    }
}

// const url = "https://localhost:3000/?uri=http://example.org/signalgroup/6";
const host = "https://localhost:3000";
let client = getClient(host);
const signalGroup = "http://example.org/signalgroup/6"; // retrieve from connection that is clicked

getSignalGroup(client, signalGroup).then((data) => console.log(data))