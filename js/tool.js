//=======BASE IMAGE FUNCTIONS
// Toggle visibility of the drag/drop div and img element
function toggleBaseImageDragDrop() {
	baseImageDropArea.toggle();
	baseImageElement.toggle();
}

function setBaseImageFromFile(file) {
	baseImageElement.attr('src', window.URL.createObjectURL(file));
	originalBaseImageSrc = baseImageElement.attr('src');
	onSetBaseImage()
}

function setBaseImageFromUrl(url) {
	baseImageElement.attr('src', url);
	originalBaseImageSrc = baseImageElement.attr('src');
	onSetBaseImage()
}

function onSetBaseImage() {
	toggleBaseImageDragDrop();
	//launchImageEditor();
	$('.js-baseImageChoiceControls').hide()
	$('.js-baseImageControls').show()
	$('.js-overlayImageContainer').show()
	$('.js-overlayImageEditorPane').show()
}

function clearBaseImage() {
	baseImageElement.attr('src', '');
}

function validateBaseImageFileType(file) {
	if (fileIsSupported(file)) {
		setBaseImageFromFile(file);
		return true;
	}
	else {
		alert('Try a JPEG or PNG image');
		return false;
	}
}

function launchImageEditor(type) {
	currentImageEditType = type
	if(currentImageEditType == 'base') {
		if (!originalBaseImageSrc) {
			alert('Drop an image in the base image drop area first.');
			return false;
		}

		// Get the image to be edited
		// `[0]` gets the image itself, not the jQuery object
		currentBaseImage = $('.js-baseImageToEdit')[0];

		creativeSDKImageEditor.launch({
			image: currentBaseImage.id,
			//url: currentImage.src
		});
	} else if(currentImageEditType == 'overlay') {
		if (!originalOverlayImageSrc) {
			alert('Drop an image in the overlay image drop area first.');
			return false;
		}

		// Get the image to be edited
		// `[0]` gets the image itself, not the jQuery object
		currentOverlayImage = $('.js-overlayImageToEdit')[0];

		creativeSDKImageEditor.launch({
			image: currentOverlayImage.id,
			//url: currentImage.src
		});
	}
	
}

//=========OVERLAY IMAGE FUNCTION

// Toggle visibility of the drag/drop div and img element
function toggleOverlayImageDragDrop() {
	overlayImageDropArea.toggle();
	overlayImageElement.toggle();
}

function setOverlayImageFromFile(file) {
	overlayImageElement.attr('src', window.URL.createObjectURL(file));
	originalOverlayImageSrc = overlayImageElement.attr('src');
	onSetOverlayImage()
}

function setOverlayImageFromUrl(url) {
	overlayImageElement.attr('src', url);
	originalOverlayImageSrc = overlayImageElement.attr('src');
	onSetOverlayImage()
}

function onSetOverlayImage() {
	toggleOverlayImageDragDrop();
	$('.js-overlayImageChoiceControls').hide()
	$('.js-overlayImageControls').show()
}

function clearOverlayImage() {
	overlayImageElement.attr('src', '');
}

function validateOverlayImageFileType(file) {
	if (fileIsSupported(file)) {
		setOverlayImageFromFile(file);
		return true;
	}
	else {
		alert('Try a JPEG or PNG image');
		return false;
	}
}

//=======GENEREAL FUNCTIONS

function handleSelectSearchResultImageForType(type, url) {
	if(type == 'base') {
		setBaseImageFromUrl(url)
	} else if(type == 'overlay') {
		setOverlayImageFromUrl(url)
	}
}

// Checks if the file type is in the array of supported types
function fileIsSupported(file) {
	var supportedFileTypes = ['image/jpeg', 'image/png'];
	return supportedFileTypes.indexOf(file.type) >= 0 ? true : false;
}

function downloadImage() {
	var url = currentBaseImage ? currentBaseImage.src : originalBaseImageSrc;
	var link = document.createElement("a");
	
	link.href = url;

	// Download attr 
	//// Only honored for links within same origin, 
	//// therefore won't work once img has been edited (i.e., S3 URLs)
	link.download = 'hero-image-' + Date.now();
	link.click();
}

var baseImageElement, baseImageDropArea, 
	overlayImageElement, overlayImageDropArea, 
	originalBaseImageSrc /*assigned when image file is dropped*/, 
	currentBaseImage /*assigned when the Edit button is clicked*/, 
	originalOverlayImageSrc /*assigned when image file is dropped*/, 
	currentBaseImage /*assigned when the Edit button is clicked*/, 
	creativeSDKImageEditor

$(document).ready(function() {
	// The visibility of these 2 elements is toggled by `toggleDragDrop()`
	baseImageElement = $('.js-baseImageToEdit').hide();
	baseImageDropArea = $('.js-baseImageDropArea');

	overlayImageElement = $('.js-overlayImageToEdit').hide();
	overlayImageDropArea = $('.js-overlayImageDropArea');

	// Image Editor configuration
	creativeSDKImageEditor = new Aviary.Feather({
		apiKey: creativeSDKConfig.apiKey,
		onSave: function(imageID, newURL) {
			if(currentImageEditType == 'base') currentBaseImage.src = newURL;
			if(currentImageEditType == 'overlay') currentOverlayImage.src = newURL;
			creativeSDKImageEditor.close();
			console.log(newURL);
		},
		onError: function(errorObj) {
			console.log(errorObj.code);
			console.log(errorObj.message);
			console.log(errorObj.args);
		}
	});

	$('#table-editor').css('height',$(window).height())

	attachBaseImageEditQueries()
	attachOverlayImageEditQueries()

	// Download
	$('.js-downloadImageButton').click(function(e) {
		e.preventDefault();

		if (baseImageElement.attr('src')) {
			downloadImage();
		}
		else {
			alert("Nothing to download.");
		}
	});


	

	

	//SEARCH------
	UnsplashSearchHandler.attachSearchJQueries()
});

function attachBaseImageEditQueries() {
	// Drop to upload
	//// Prevent defaults on drag/drop events
	baseImageDropArea.on('drag dragstart dragend dragover dragenter dragleave drop', function(e) {
		if (e.preventDefault) e.preventDefault(); 
		if (e.stopPropagation) e.stopPropagation(); 
	})
	.on('click', function(e) {
		// Click anywhere in Droparea to upload file
	  $('.js-clickToUploadBaseImageInput').click();
	})
	.on('drop', function(e) {
		// Get the dropped file
		var file = e.originalEvent.dataTransfer.files[0];
		validateBaseImageFileType(file);
	});

	// Click to Start Upload
	//// Takes file from file chooser
	$('.js-clickToUploadBaseImageInput').on('change', function(e){
		var file = e.originalEvent.target.files[0];
		validateBaseImageFileType(file);
	});

	$('.js-baseImageSearchInput').keyup(() => {
		if(UnsplashSearchHandler.baseImageSearchTimeout) {
			clearTimeout(UnsplashSearchHandler.baseImageSearchTimeout)
		}
		UnsplashSearchHandler.baseImageSearchTimeout = setTimeout(() => {
			UnsplashSearchHandler.handleSearchByType('base', true)
		}, 1000)
	})

	//click area -> upload
	$('.js-clickToUploadBaseImage').click(function(e) {
		$('.js-clickToUploadBaseImageInput').click();
	})

	// Edit
	$('.js-editBaseImageButton').click(function() {
		launchImageEditor('base');
	});

	// Reset
	$('.js-resetBaseImageButton').click(function() {
		if ($('.js-baseImageToEdit').attr('src') === originalBaseImageSrc || !originalBaseImageSrc) {
			alert('Nothing to reset.');
		}
		else {
			$('.js-baseImageToEdit').attr('src', originalBaseImageSrc);
		}
	});

	// Clear
	$('.js-clearBaseImageButton').click(function() {
		if (baseImageElement.attr('src')) {
			clearBaseImage();
			toggleBaseImageDragDrop();
			$('.js-baseImageControls').hide()
			$('.js-overlayImageContainer').hide()
			$('.js-overlayImageEditorPane').hide()
			$('.js-baseImageChoiceControls').show()
		}
		else {
			alert("Nothing to clear in base image.");
		}
	});
}


function attachOverlayImageEditQueries() {
	// Drop to upload
	//// Prevent defaults on drag/drop events
	baseImageDropArea.on('drag dragstart dragend dragover dragenter dragleave drop', function(e) {
		if (e.preventDefault) e.preventDefault(); 
		if (e.stopPropagation) e.stopPropagation(); 
	})
	.on('click', function(e) {
		// Click anywhere in Droparea to upload file
	  $('.js-clickToUploadOverlayImageInput').click();
	})
	.on('drop', function(e) {
		// Get the dropped file
		var file = e.originalEvent.dataTransfer.files[0];
		validateOverlayImageFileType(file);
	});

	// Click to Start Upload
	//// Takes file from file chooser
	$('.js-clickToUploadOverlayImageInput').on('change', function(e){
		var file = e.originalEvent.target.files[0];
		validateOverlayImageFileType(file);
	});

	$('.js-overlayImageSearchInput').keyup(() => {
		if(UnsplashSearchHandler.overlayImageSearchTimeout) {
			clearTimeout(UnsplashSearchHandler.overlayImageSearchTimeout)
		}
		UnsplashSearchHandler.ovrlayImageSearchTimeout = setTimeout(() => {
			UnsplashSearchHandler.handleSearchByType('overlay', true)
		}, 1000)
	})

	//click area -> upload
	$('.js-clickToUploadOverlayImage').click(function(e) {
		$('.js-clickToUploadOverlayImageInput').click();
	})

	// Edit
	$('.js-editOverlayImageButton').click(function() {
		launchImageEditor('overlay');
	});

	// Reset
	$('.js-resetOverlayImageButton').click(function() {
		if ($('.js-overlayImageToEdit').attr('src') === originalOverlayImageSrc || !originalOverlayImageSrc) {
			alert('Nothing to reset.');
		}
		else {
			$('.js-overlayImageToEdit').attr('src', originalOverlayImageSrc);
		}
	});

	// Clear
	$('.js-clearOverlayImageButton').click(function() {
		if (overlayImageElement.attr('src')) {
			clearOverlayImage();
			toggleOverlayImageDragDrop();
		}
		else {
			alert("Nothing to clear in overlay image.");
		}
	});
}