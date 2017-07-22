//=======BASE IMAGE FUNCTIONS
// Toggle visibility of the drag/drop div and img element
function toggleBaseImageDragDrop() {
	baseImageDropArea.toggle();
	baseImageElement.toggle();
}

function setBaseImageFromFile(file) {
	baseImageElement.attr('src', window.URL.createObjectURL(file));
	originalBaseImageSrc = baseImageElement.attr('src');
	setTimeout(() => {
		FileUtils.getBase64(file, (base64Url) => {
			LocalStorageUtil.addNewImageBase64UrlUpload(base64Url)
		})
	}, 250)
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
	$('.js-mergedImageControls').show()
	$('.js-downloadMergedImageButton').show()

	$('.js-downloadMergedImageButton').unbind()
	$('.js-downloadMergedImageButton').click(function() { 
        downloadMergedImage()
	});
	recreateMergedImage()
}

function clearBaseImage() {
	baseImageElement.attr('src', '');
	//recreateMergedImage()
	toggleBaseImageDragDrop();
	$('.js-baseImageControls').hide()
	$('.js-overlayImageContainer').hide()
	$('.js-overlayImageEditorPane').hide()
	$('.js-mergedImageControls').hide()
	$('.js-downloadMergedImageButton').hide()
	$('.js-baseImageChoiceControls').show()
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

//=========OVERLAY IMAGE FUNCTION

// Toggle visibility of the drag/drop div and img element
function toggleOverlayImageDragDrop() {
	overlayImageDropArea.toggle();
	overlayImageElement.toggle();
}

function setOverlayImageFromFile(file) {
	overlayImageElement.attr('src', window.URL.createObjectURL(file));
	originalOverlayImageSrc = overlayImageElement.attr('src');
	
	setTimeout(() => {
		FileUtils.getBase64(file, (base64Url) => {
			LocalStorageUtil.addNewImageBase64UrlUpload(base64Url)
		})
	}, 250)
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
	$('.js-mergedImageControlOverlayContainer').show()
	recreateMergedImage()
}

function clearOverlayImage() {
	overlayImageElement.attr('src', '');
	$('.js-overlayImageControls').hide()
	$('.js-mergedImageControlOverlayContainer').hide()
	$('.js-overlayImageChoiceControls').show()
	recreateMergedImage()
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

//=======MERGED IMAGE FUNCTIONS

function getMergedImageUrl(onSuccess) {
	getMergedImageCanvasFromHTML2Canvas((canvas) => {
			onSuccess(canvas.toDataURL("image/png"))
	})
}

var inLineToRender = 0
var scrollPos
function getMergedImageCanvasFromHTML2Canvas(onRendered) {
	$('#merged-image-creation-canvas').show()
	$('#merged-image-creation-canvas').css('opacity', '1')
	inLineToRender++
	scrollPos = document.body.scrollTop;
	html2canvas($('#merged-image-creation-canvas'), {
		onrendered: (canvas) => {
			onRendered(canvas)
			inLineToRender--
			if(inLineToRender < 1) $('#merged-image-creation-canvas').css('opacity', '0.01')
			window.scrollTo(0,scrollPos);
		},
    	useCORS: true
	})
}

function recreateMergedImage() {
	const baseSrc =  $(baseImageElement).attr('src')
	const overlaySrc =  $(overlayImageElement).attr('src')
	
	$('.js-mergeImageBase').attr('src', baseSrc);
	const width = $('.js-mergeImageBase').css('width')
	const height = $('.js-mergeImageBase').css('height')
	$('#merged-image-creation-canvas').css('width', width)
	$('#merged-image-creation-canvas').css('height', height)

	$('.js-mergeImageOverlay').attr('src', overlaySrc);
	$('.js-mergeImageOverlay').css('width', width)
	$('.js-mergeImageOverlay').css('height', height)
	
	getMergedImageUrl(function(url) {
		document.getElementById('merged-image-to-edit').innerHTML = '';
		document.getElementById('merged-image-to-edit').src = url
		originalMergedImageSrc = url
		$('.js-mergedImageToEdit').show()
	})
}

function updateMergeImageOverlayOpacity(opacity) {
	$('.js-mergeImageOverlay').css('opacity', opacity || 0.2)
	recreateMergedImage()
}

//=======GENEREAL FUNCTIONS
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
	} else if(currentImageEditType == 'merged') {
		if (!originalMergedImageSrc) {
			alert('Choose base and overlay images first.');
			return false;
		}

		// Get the image to be edited
		// `[0]` gets the image itself, not the jQuery object
		currentMergedImage = $('.js-mergedImageToEdit')[0];

		creativeSDKImageEditor.launch({
			image: currentMergedImage.id,
			//url: currentImage.src
		});
	}
	
}

function handleSelectImageForType(type, data) {
	function setImageUrl(imageUrl) {
		if(type == 'base') {
			setBaseImageFromUrl(imageUrl)
		} else if(type == 'overlay') {
			setOverlayImageFromUrl(imageUrl)
		}
	}

	if(data.base64Url) {
		return setImageUrl(data.base64Url)
	}

	getImageUrlBase64Url(data.url, function(base64Url){
		setImageUrl(base64Url)
	}, function(err) {
		console.log(JSON.stringify(err))
	})
}

function getImageUrlBase64Url(imageUrl, onSuccess, onFail) {
	$.post("service/convert/image/url/base64?url=" + imageUrl )
		.then(function(response){
			debugger
			onSuccess(response.base64Url)
		}, function(err) {
			if(onFail) onFail(err)
		})
}

// Checks if the file type is in the array of supported types
function fileIsSupported(file) {
	var supportedFileTypes = ['image/jpeg', 'image/png'];
	return supportedFileTypes.indexOf(file.type) >= 0 ? true : false;
}

function downloadImageOfType(type) {
	var url
	if(type == 'merged') {
		downloadMergedImage()
		return
	}

	if(type == 'base') url = currentBaseImage ? currentBaseImage.src : originalBaseImageSrc;
	else if(type == 'overlay') url = currentBaseImage ? currentBaseImage.src : originalBaseImageSrc;
	var link = document.createElement("a");
	link.href = url;

	// Download attr 
	//// Only honored for links within same origin, 
	//// therefore won't work once img has been edited (i.e., S3 URLs)
	link.download = 'hero-image-' + type + Date.now();
	link.click();
}

function downloadMergedImage() {
	setTimeout(function(){$("#show-final-image-modal").click()},5)

	getMergedImageCanvasFromHTML2Canvas((canvas) => {
		theCanvas = canvas;
		document.getElementById('final-image-canvas').innerHTML = '';
		document.getElementById('final-image-canvas').appendChild(canvas);

		canvas.toBlob(function(blob) {
			saveAs(blob, 'my-hero-image' + Date.now() + '.png'); 
		});
	})
}

var baseImageElement, baseImageDropArea, 
	overlayImageElement, overlayImageDropArea, 
	originalBaseImageSrc /*assigned when image file is dropped*/, 
	currentBaseImage /*assigned when the Edit button is clicked*/, 
	originalOverlayImageSrc /*assigned when image file is dropped*/, 
	currentOverlayImage /*assigned when the Edit button is clicked*/, 
	originalMergedImageSrc /*assigned when image file is dropped*/, 
	currentMergedImage /*assigned when the Edit button is clicked*/, 
	editedMergedImageSrc,
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
			getImageUrlBase64Url(newURL, function(newURL){
				if(currentImageEditType == 'base') {
					currentBaseImage.src = newURL;
					recreateMergedImage()
				}
				if(currentImageEditType == 'overlay') {
					currentOverlayImage.src = newURL;
					recreateMergedImage()
				}
				if(currentImageEditType == 'merged') {
					editedMergedImageSrc = currentMergedImage.src
					currentMergedImage.src = newURL;
					recreateMergedImage()
				}
				creativeSDKImageEditor.close();
			}, function(err) {
				console.log(JSON.stringify(err))
			})
			console.log(newURL);
		},
		onError: function(errorObj) {
			console.log(errorObj.code);
			console.log(errorObj.message);
			console.log(errorObj.args);
		}
	});

	$('#table-editor').css('height',$(window).height())
	// Initialize a new plugin instance for all
    // e.g. $('input[type="range"]') elements.
    $('input[type="range"]').rangeslider();

	attachBaseImageEditQueries()
	attachOverlayImageEditQueries()
	attachMergedImageEditQueries()
	
    $('.js-downloadBaseImageButton').click(function() { 
        downloadImageOfType('base')
	});

	$('.js-downloadOverlayImageButton').click(function() { 
        downloadImageOfType('overlay')
	});

	$('.js-downloadMergedImageButton').click(function() { 
        downloadMergedImage()
	});

	$('.js-scrollToBaseImagePane').click(function() { 
		$('html,body').animate({
			scrollTop: $(".js-baseImageEditorPane").offset().top
		})
	})
	$('.js-scrollToOverlayImagePane').click(function() { 
		$('html,body').animate({
			scrollTop: $(".js-overlayImageEditorPane").offset().top
		})
	})
	$('.js-scrollToMergedImagePane').click(function() { 
		$('html,body').animate({
			scrollTop: $(".js-mergedImageEditorPane").offset().top
		})
	})
});

function attachBaseImageEditQueries() {
	// Drop to upload
	//// Prevent defaults on drag/drop events
	baseImageDropArea.on('drag dragstart dragend dragover dragenter dragleave drop', function(e) {
		if (e.preventDefault) e.preventDefault(); 
		if (e.stopPropagation) e.stopPropagation(); 
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
	$(baseImageDropArea).click(clickInputToStartUpload)
	$('.js-clickToUploadBaseImage').click(clickInputToStartUpload)

	function clickInputToStartUpload() {
		$('.js-clickToUploadBaseImageInput').click();
	}

	// Edit
	$('.js-editBaseImageButton').click(function() {
		launchImageEditor('base');
	});
	$('.js-baseImageToEdit').click(function() {
		launchImageEditor('base');
	});
	// Reset
	$('.js-resetBaseImageButton').click(function() {
		if ($('.js-baseImageToEdit').attr('src') === originalBaseImageSrc || !originalBaseImageSrc) {
			alert('Nothing to reset.');
		}
		else {
			$('.js-baseImageToEdit').attr('src', originalBaseImageSrc);
			recreateMergedImage()
		}
	});

	// Clear
	$('.js-clearBaseImageButton').click(function() {
		if (baseImageElement.attr('src')) {
			clearBaseImage();
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
	$(overlayImageDropArea).click(clickInputToStartUpload)
	$('.js-clickToUploadOverlayImage').click(clickInputToStartUpload)

	function clickInputToStartUpload() {
		$('.js-clickToUploadOverlayImageInput').click();
	}

	// Edit
	$('.js-editOverlayImageButton').click(function() {
		launchImageEditor('overlay');
	});
	$('.js-overlayImageToEdit').click(function() {
		launchImageEditor('overlay');
	});

	// Reset
	$('.js-resetOverlayImageButton').click(function() {
		if ($('.js-overlayImageToEdit').attr('src') === originalOverlayImageSrc || !originalOverlayImageSrc) {
			alert('Nothing to reset.');
		}
		else {
			$('.js-overlayImageToEdit').attr('src', originalOverlayImageSrc);
			recreateMergedImage()
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

function attachMergedImageEditQueries() {
	// Edit
	$('.js-editMergedImageButton').click(function() {
		launchImageEditor('merged');
	});
	$('.js-mergedImageToEdit').click(function() {
		launchImageEditor('merged');
	});
}