$(document).ready(function() {

	// The visibility of these 2 elements is toggled by `toggleDragDrop()`
	var baseImageElement = $('.js-baseImageToEdit').hide();
	var baseImageDropArea = $('.js-baseImageDropArea');

	var overlayImageElement = $('.js-overlayImageToEdit').hide();
	var overlayImageDropArea = $('.js-overayImageDropArea');

	var originalBaseImageSrc; // assigned when image file is dropped
	var currentBaseImage; // assigned when the Edit button is clicked

	var originalOverlayImageSrc; // assigned when image file is dropped
	var currentOverlayImage; // assigned when the Edit button is clicked

	// Image Editor configuration
	var csdkImageEditor = new Aviary.Feather({
		apiKey: configObj.apiKey,
		onSave: function(imageID, newURL) {
			currentBaseImage.src = newURL;
			csdkImageEditor.close();
			console.log(newURL);
		},
		onError: function(errorObj) {
			console.log(errorObj.code);
			console.log(errorObj.message);
			console.log(errorObj.args);
		}
	});
	$('#table-editor').css('height',$(window).height())

	// Edit
	$('.js-editBaseImageButton').click(function() {
		launchBaseImageEditor();
	});

	// Reset
	$('.js-resetBaseImageButton').click(function() {

		if ($('.js-imageToEdit').attr('src') === originalBaseImageSrc || !originalBaseImageSrc) {
			alert('Nothing to reset.');
		}
		else {
			$('.js-imageToEdit').attr('src', originalBaseImageSrc);
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
			alert("Nothing to clear.");
		}
	});

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

	$('.js-clickToUploadBaseImage').click(function(e) {
		$('.js-clickToUploadBaseImageInput').click();
	})


	// Drop
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

	// Click
	//// Takes file from file chooser
	$('.js-clickToUploadBaseImageInput').on('change', function(e){
		var file = e.originalEvent.target.files[0];
		validateBaseImageFileType(file);
	});

	// Checks if the file type is in the array of supported types
	function fileIsSupported(file) {
		var supportedFileTypes = ['image/jpeg', 'image/png'];
		return supportedFileTypes.indexOf(file.type) >= 0 ? true : false;
	}

	// Toggle visibility of the drag/drop div and img element
	function toggleBaseImageDragDrop() {
		baseImageDropArea.toggle();
		baseImageElement.toggle();
	}

	function setBaseImageFromFile(file) {
		baseImageElement.attr('src', window.URL.createObjectURL(file));
		originalBaseImageSrc = baseImageElement.attr('src');
	}

	function setBaseImageFromUrl(url) {
		baseImageElement.attr('src', url);
	}

	function setOverlayImageFromUrl(url) {
		overlayImageElement.attr('src', url);
	}

	function clearBaseImage() {
		baseImageElement.attr('src', '');
	}

	function handleSelectSearchResultImageForType(type, url) {
		if(type == 'base') {
			setBaseImageFromUrl(url)
		} else if(type == 'overlay') {
			setOverlayImageFromUrl(url)
		}
	}

	function validateBaseImageFileType(file) {
		if (fileIsSupported(file)) {
			setBaseImageFromFile(file);
			toggleBaseImageDragDrop();
			//launchImageEditor();
			$('.js-baseImageChoiceControls').hide()
			$('.js-baseImageControls').show()
			$('.js-overlayImageContainer').show()
			$('.js-overlayImageEditorPane').show()
			return true;
		}
		else {
			alert('Try a JPEG or PNG image');
			return false;
		}
	}

	function launchBaseImageEditor() {
		if (!originalBaseImageSrc) {
			alert('Drop an image in the drop area first.');
			return false;
		}

		// Get the image to be edited
		// `[0]` gets the image itself, not the jQuery object
		currentBaseImage = $('.js-imageToEdit')[0];

		csdkImageEditor.launch({
			image: currentBaseImage.id,
			//url: currentImage.src
		});
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

	$('.js-baseImageSearchInput').keyup(() => {
		if(UnsplashSearchHandler.baseImageSearchTimeout) {
			debugger
			clearTimeout(UnsplashSearchHandler.baseImageSearchTimeout)
		}
		UnsplashSearchHandler.baseImageSearchTimeout = setTimeout(() => {
			UnsplashSearchHandler.handleSearchByType('base', true)
		}, 1000)
	})

	$('.js-baseImageSearchButton').click(() => {
		UnsplashSearchHandler.handleSearchByType('base')	
	})

	$('.js-baseImageSearchLoadMoreButton').click(() => {
		UnsplashSearchHandler.handleSearchByType('base')	
	})

	$('.js-overlayImageSearchInput').keyup(() => {
		if(UnsplashSearchHandler.overlayImageSearchTimeout) {
			clearTimeout(UnsplashSearchHandler.overlayImageSearchTimeout)
		}
		UnsplashSearchHandler.overlayImageSearchTimeout = setTimeout(() => {
			UnsplashSearchHandler.handleSearchByType('overlay', true)
		}, 1000)	
	})

	$('.js-overlayImageSearchButton').click(() => {
		UnsplashSearchHandler.handleSearchByType('overlay')	
	})

	$('.js-overlayImageSearchLoadMoreButton').click(() => {
		UnsplashSearchHandler.handleSearchByType('overlay')	
	})

	function UnsplashSearchHandler(keywords) {
		const vars = {}
		vars.results = []
		vars.resultIds = {}
		vars.keywords = keywords
		
		vars.nextPage = 1
		vars.isSearching = false
		vars.totalPages = Number.MAX_SAFE_INTEGER

		this.incrementNextPage = () => vars.nextPage++
		this.getNextPage = () => {
			return vars.nextPage;
		}
		this.isSearching = () => { return vars.isSearching }
		this.startSearch = () => vars.isSearching = true
		this.endSearch = () => vars.isSearching = false
		this.canSearchMore = () => { return vars.nextPage < vars.totalPages }
		this.hasResults = () => { return vars.results.length }

		this.addResultsAndIncrementNextPage = function(type, resultsData) {
			vars.totalPages = resultsData.total_pages
			this.incrementNextPage()
			resultsData.results.forEach((result) => {
				if(vars.resultIds[result.id]) return
				const image = {
					id: result.id,
					url: result.urls.regular,
					thumbUrl: result.urls.thumb,
					user: {
						name: result.user.name,
						username: result.user.username,
						handle: '@' + result.user.username
					}
				}
				vars.resultIds[image.id] = true
				vars.results.push(image)
				addResultHTMLToResults(type, image)
			})
			adjustResultsDims(type)
			if(this.canSearchMore()) {
				$('.js-' + type + 'ImageSearchLoadMoreButton').show()
			}
		}

		this.showAllResults = (type) => {
			if(!vars.results.length) return
			$('.js-' + type + 'ImageSearchResults').html('')
			vars.results.forEach((image) => {
				addResultHTMLToResults(type, image)
			})
			adjustResultsDims(type)
		}
		const adjustResultsDims = (type) => {
			$('.js-' + type + 'ImageSearchResults').css('height', UnsplashSearchHandler.resultHeight * vars.results.length)
		}
		const addResultHTMLToResults = (type, image) => {
			var imgHTML = '<img class="js-' + type + 'ImageSearchResultClickToSelect" src="' + image.thumbUrl + '" data-regular-url="' + image.url + '" style="width:100%;"/>'
			var attributionLinkHTML = '<a class="link text-t1" style="position: relative; height 10px; width:100%; background:#fff; bottom:20px" href="https://unsplash.com/'+image.user.handle+'?utm_source=SMedianHeroImage">' + image.user.name + ' / Unsplash</a>'
			$('.js-' + type + 'ImageSearchResults').append('<div style="width:100%;">' + imgHTML + attributionLinkHTML + '</div>' )
			$('.js-' + type + 'ImageSearchResultClickToSelect').click(function() {
				debugger
				handleSelectSearchResultImageForType(type, $(this).data('regular-url'))
			})
		}
	}

	UnsplashSearchHandler.APP_ID = 'c2e962aba1fd8e5c013758468fa0eca18c818673a6cc81b656c32d084669ce15'
	UnsplashSearchHandler.keywordHandlersMap = {}
	UnsplashSearchHandler.lastSearchType = { 'base': {}, 'overlay': {} }
	UnsplashSearchHandler.resultWidth = 50
	UnsplashSearchHandler.resultHeight = 50

	UnsplashSearchHandler.handleSearchByType = function(type, isFromKeyup) {
		var keywords = $('.js-' + type + 'ImageSearchInput').val()
		if(!keywords || keywords.trim().length < 3) {
			return
		}
		keywords = keywords.trim()
		const handler = UnsplashSearchHandler.getByKeywords(keywords)
		if(isFromKeyup && handler.getNextPage() != 1) {
			return
		}
		if(handler.isSearching()) {
			$('.js-' + type + 'ImageSearchLoadMoreButton').hide()
			return
		}
		if(!handler.canSearchMore()) {
			$('.js-' + type + 'ImageSearchLoadMoreButton').hide()
			return $('.js-' + type + 'ImageSearchExhausted').show()
		} else {
			$('.js-' + type + 'ImageSearchExhausted').hide()
		}

		var endpoint = 'https://api.unsplash.com/search/photos/?client_id=' + UnsplashSearchHandler.APP_ID
		endpoint += '&query=' + keywords
		endpoint += '&page=' + handler.getNextPage()
		
		if(UnsplashSearchHandler.lastSearchType[type].keywords != keywords) {
			if(handler.hasResults()) {
				UnsplashSearchHandler.lastSearchType[type].wasLast = true
				if(handler.canSearchMore()) $('.js-' + type + 'ImageSearchLoadMoreButton').show()
				return handler.showAllResults(type)
			}
		}
		if(!UnsplashSearchHandler.lastSearchType[type].wasLast) {
			if(handler.hasResults()) {
				UnsplashSearchHandler.lastSearchType[type].wasLast = true
				if(handler.canSearchMore()) $('.js-' + type + 'ImageSearchLoadMoreButton').show()
				return handler.showAllResults(type)
			}
		}
		
		$('.js-' + type + 'ImageSearchLoadMoreButton').hide()
		if(handler.isSearching()) {
			debugger
			return
		}
		handler.startSearch()
		UnsplashSearchHandler.lastSearchType[type].keywords = keywords
		UnsplashSearchHandler.lastSearchType[type].wasLast = true
		$('.js-' + type + 'ImageSearchExhausted').show()
		$.get(endpoint, function(data, status) {
			if(status != "success") {
				handler.endSearch()
				return
			}
			UnsplashSearchHandler.handleResultsFor(type, keywords, data)
		})
	}

	UnsplashSearchHandler.getByKeywords = (keywords) => {
		if(!keywords) return
		keywords = keywords.trim()
		if(!UnsplashSearchHandler.keywordHandlersMap[keywords]) {
			UnsplashSearchHandler.keywordHandlersMap[keywords] = new UnsplashSearchHandler(keywords)
		}
		return UnsplashSearchHandler.keywordHandlersMap[keywords]
	}

	UnsplashSearchHandler.handleResultsFor = (type, keywords, responseData) => {
		const handler = UnsplashSearchHandler.getByKeywords(keywords)
		handler.addResultsAndIncrementNextPage(type, responseData)
		handler.endSearch()
	}
});