angularApp
	.controller('AppCtrl', function AppCtrl($scope, $timeout, IOSocket) {
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

    $scope.openImageSearchFormForType = function(type) {
        $scope.currentImageSearchType = type
        $scope.imageSearchFormIsOpen = true;
    }

    $scope.closeImageSearchForm = function() {
        $scope.imageSearchFormIsOpen = false;
    }

    $scope.handleSelectSearchResultImageForType = function(image) {
        if($scope.currentImageSearchType == 'base') {
            setBaseImageFromUrl(image.url)
        } else if(type == 'overlay') {
            setOverlayImageFromUrl(image.url)
        }
        $scope.searchImagesFormIsOpen = false
    }

    $scope.imageSearchResultsTypeMap = {base: [], overlay: []}

    $scope.updateMergedImageOverlayOpacity = function() {
        updateMergeImageOverlayOpacity($scope.mergeImageOpacity)
    }

    $(document).ready(function() {
        UnsplashSearchHandler.attachSearchJQueries($scope, $timeout)
    })
})