
var PHServer=require('./../ph-server');

//localPort 9898 represents the listener on the amazon host whereas remoteAddress/remotePort indicate the destination of the forwarding 
var phs=new PHServer({
    localPort: process.env.PORT || 9898,
    clients: {
	'ClientId-A':{
	    secret: '1234',
	    cert: 'werergwgv451y1',
	    remoteHost: 'localhost',
	    remotePort:5432,
	    auth: 'SSL'
	},
	'ClientId-B':{
	    secret: '143434',
	    cert: 'werw34tf34gou3hgvoi3jg5oij35gij3',
	    remoteHost: '3.39.108.121',
	    remotePort: 21,
	    auth: 'Basic'
	}
    }
});

//command: DEBUG=ph:server node ph-server
