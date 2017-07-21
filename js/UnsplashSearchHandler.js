function UnsplashSearchHandler(keywords) {
    //https://unsplash.com/oauth/applications/10989
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
        var attributionLinkHTML = '<a class="link text-t1" style="position: relative; height 10px; width:100%; background:#fff; bottom:20px" href="https://unsplash.com/'+image.user.handle+'?utm_source=SMedianHeroImage&utm_medium=referral&utm_campaign=api-credit">' + image.user.name + ' / Unsplash</a>'
        $('.js-' + type + 'ImageSearchResults').append('<div style="width:100%;">' + imgHTML + attributionLinkHTML + '</div>' )
        $('.js-' + type + 'ImageSearchResultClickToSelect').unbind();
        $('.js-' + type + 'ImageSearchResultClickToSelect').click(function() {
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
    if(isFromKeyup && handler.getNextPage() != 1 && UnsplashSearchHandler.lastSearchType[type].wasLast) {
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

UnsplashSearchHandler.attachSearchJQueries = function() {
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
}