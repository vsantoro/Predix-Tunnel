'use strict';

const net = require('net');
const WebSocketServer = require('websocket').server;
const http = require('http');
const PHCommon = require('./lib/common');
const mRequest = require('request-promise');

class PHServer extends PHCommon {

    constructor(options) {

        super(options);

        const debug = this.debug('ph:server');

        let sockets = this.sockets;

        const httpServer = http.createServer((request, response) => {
            debug((new Date()) + ' Received request for ' + request.url);
            response.writeHead(404);
            response.end();
        });

        httpServer.listen(options.localPort, _ => {
            debug((new Date()) + ' Server is listening on port#' + options.localPort);
        });

        const phServer = new WebSocketServer({
            httpServer: httpServer,
            autoAcceptConnections: false
        });

        phServer.on('request', (request) => {

            const clientid = request.httpRequest.headers['clientid'];
            const token = (new Buffer(request.httpRequest.headers['authorization'].split(' ')[1])).toString();
            const clientInfos = JSON.parse(process.env.CLIENT);
			console.log(clientInfos);
            const currentClient = clientInfos.tunnel;
            const clientHeader = new Buffer(currentClient.clientid + ':' + currentClient.clientsecret).toString('base64');
			console.log('uaa_url: ' + currentClient.validate_uaa_url);
            const requestOptions = {
            	method: 'POST',
            	url: currentClient.validate_uaa_url,
            	headers: {
            		'Authorization': 'Basic ' + clientHeader
            	},
            	form: {
            		token: token
            	},
            	resolveWithFullResponse: true
            }

			mRequest(requestOptions)
				.then((httpResponse) => {
					debug('after calling %s', httpResponse.statusCode);

					if (httpResponse.statusCode === 200) {
			            let c = request.accept(request.origin);
			            debug((new Date()) + ' Connection accepted.');

			            let _sId = this.generateSessionId();
			            //let _bind=super.bind;

			            sockets[_sId] = { local: c };

			            debug('new connection: port=%s, remote { host=%s, port=%s }', options.localPort, c.remoteAddress, c.remotePort);

			            this.emit('connection', options.localPort, c);

			            c.once('close', (reasonCode, description) => {
			                debug((new Date()) + ' Peer ' + c.remoteAddress + ' disconnected.');
			                debug('connection close: port=%s, remote { host=%s, port=%s }', options.localPort, c.remoteAddress, c.remotePort);

			            });

			            sockets[_sId].remote = net.connect(currentClient.remotePort, currentClient.remoteHost, _ => {
			                debug('connection{remotePort=%s} connected', currentClient.remotePort);
			                this.emit('remote connect', sockets[_sId].remote);

			                this.bind(_sId);
			            });
					} else {
						request.reject();
						return;
					}
				})
				.catch ((error) => {
					debug('Received http code [%s] from UAA, invalid token [%s]', error, token);
					request.reject();
				});				
        });

        phServer.on('error', err => {
            debug('port error: port=%s, error=%s', options.localPort, err);
            this.emit('port error', options.localPort, err);
        });

        phServer.on('close', _ => {
            debug('port close: port=%s', options.localPort);
            this.emit('port close', options.localPort);
        });

        const originIsAllowed = (origin) => {
            return true;
        }

    };

}

module.exports = PHServer;
