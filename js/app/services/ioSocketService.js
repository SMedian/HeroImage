angularApp
	.factory('IOSocket', function (socketFactory) {
        var socket = socketFactory();
        socket.forward('broadcast');
        socket.forward('numClients');
        socket.forward('imageUrlBase64Url');
        return socket;
    })