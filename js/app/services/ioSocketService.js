angularApp
	.factory('IOSocket', function (socketFactory) {
        var socket = socketFactory();
        socket.forward('broadcast');
        socket.forward('numClients');
        return socket;
    })