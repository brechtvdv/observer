const jsonld = require('jsonld');
const N3 = require('n3');
const moment = require('moment');

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
const literals = {
  // yo: N3.DataFactory.literal('Yo', 'en'),
};
const objects = {
  connection: N3.DataFactory.namedNode(EX + 'Connection'),
};

function getClient(_host) {
	const http2 = require('http2');
	const fs = require('fs');
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

async function getSignalGroup(_host, _path, _signalGroup) {
	console.log("Retrieving signalgroup data for signalgroup " + _signalGroup)
	let client = getClient(_host);

	const quads = await getQuads(client, _path)
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
    	'countDown': (minEndTime.valueOf() - generatedAt.valueOf())/1000
    }
}

// const host = "https://localhost:3000";
// const signalGroup = "http://example.org/signalgroup/6"; // retrieve from connection that is clicked

// getSignalGroup(host, '/?uri=' + signalGroup, signalGroup).then((data) => console.log(data))