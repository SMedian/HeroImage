angularApp
	.controller('AppCtrl', function AppCtrl($scope, IOSocket) {
    $scope.$on('socket:numClients', function(event, data) {
        //console.log("Got " + event.name + " Message: " + JSON.stringify(data.payload))
        var payload = data.payload;
        if (payload) {
            $scope.numActiveClients = payload + " Active Creators";
        }
    });

    $scope.uploadAndOverlay = function () {
        debugger
       var preview = document.getElementById('image-upload'); //selects the query named img
       var file    = document.querySelector('input[type=file]').files[0]; //sames as here
       var reader  = new FileReader();

       reader.onloadend = function () {
           preview.src = reader.result;
       }

       if (file) {
           reader.readAsDataURL(file); //reads the data as a URL
       } else {
           preview.src = "";
       }
    }
})