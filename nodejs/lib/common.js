'use strict';

const debug = require('debug');
const EventEmitter=require('events');

class PHCommon extends EventEmitter {

    constructor(options){
	console.log('Starting PHCommon');
	super();
	this._sockets={};
	this._options=options;
	console.log('Done with constructor()');
    }

    debug(namespace){
	return debug(namespace);
    }
    
    get sockets(){
	return this._sockets;
    }
    
    bind(sId){
	debug('binding streams');
 	let socket=this._sockets[sId];

	this.pipeTwoWay(socket.local, socket.remote);

	socket.remote.once('error', err => {
	    this.debug('connection{remotePort=%s} error: error=%s', this._options.remotePort, err);
	    this.emit('remote error', err, socket.remote);
	    this.destroy(sId);
	});
	socket.remote.once('close', _ => {
	    this.debug('connection{localPort=%s} close', this._options.localPort);
	    this.emit('remote close', socket.remote);
	    this.destroy(sId);
	});

    };

    generateSessionId() {
	return Date.now() + '.' + this.randomString(16);
    };

    randomString(size, chars){
	size = size || 6;
	chars = chars || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let max = chars.length;
	let ret = '';
	for (let i = 0; i < size; i++) {
	    ret += chars.charAt(Math.floor(Math.random() * max));
	}
	return ret;
    }

    destroy(sId){
	debug('destroy: localPort=%s, remotePort=%s', this._options.localPort, this._options.remotePort);
	let socket=this._sockets[sId];

	socket.local.destroy&&socket.local.destroy();
	socket.local.end&&socket.local.end();

	
	socket.remote&&socket.remote.destroy&&socket.remote.destroy();
	socket.remote&&socket.remote.end&&socket.remote.end();
	socket.remote&&socket.remote.close&&socket.remote.close();

	this.emit('sockets destroy');
    };

    pipe(source, dest){

	const addr = (source.address?source.address():(source.socket.address&&source.socket.address()));
	let bytes = 0;

	source.on('data', d => {
	    bytes += d.length;
	    debug('data comes');
	    debug('socket on data: %s bytes (total=%s) socket{%s:%s}', d.length, bytes, addr.address, addr.port);
	    if (dest.writable){
		debug('write raw socket');
		dest.write(d);
	    }
	    else {
		debug('write webscoket');
		//console.log(d);
		dest.sendBytes(d);
	    }
	});
	
	source.on('message', (msg)=> {
	    //console.log(msg.binaryData.toString());
	    
	    if (dest.writable){
		dest.write(msg.binaryData);
	    }
	});
	
/*
	dest.on('pong',(buf)=>{
	    let _d = new Buffer(buf, 'binary');
	    console.log(_d.toString());
	});

	dest.on('ping',(buf)=>{
	    let _d = new Buffer(buf, 'binary');
	    console.log(_d.toString());
	});
	
	source.on('pong',(buf)=>{
	    let _d = new Buffer(buf, 'binary');
	    console.log(_d.toString());
	});
*/
	
	source.on('end', _ => {
	    debug('socket on end: total %s bytes socket{%s:%s}', bytes, addr.address, addr.port);
	    dest.end?dest.end():dest.close();
	});
    }

    pipeTwoWay(a, b){
	this.pipe(a, b);
	this.pipe(b, a);
    }
    
}

module.exports=PHCommon;
