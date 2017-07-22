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
    this.startSearch = () => {
        vars.isSearching = true
        NProgress.start();
    }
    this.endSearch = () => {
        vars.isSearching = false
        NProgress.done();
    }
    this.canSearchMore = () => { return vars.nextPage < vars.totalPages }
    this.hasResults = () => { return vars.results.length }

    this.showAllResults = function(type) {
        UnsplashSearchHandler.ngScopeTimeout(() => {
            UnsplashSearchHandler.ngScope.imageSearchResultsTypeMap[type] = vars.results
            /*$('.grid').masonry({
                // options...
                itemSelector: '.grid-item',
                columnWidth: 100
            });*/
        })
    }

    this.addResultsAndIncrementNextPage = function(type, resultsData) {
        if(!resultsData.results) return
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
        })
        this.showAllResults(type)
    }

    this.getResults = () => {
        return vars.results
    }
}

function toggleLoadMoreButton(show) {
    if(show) $('.js-imageSearchLoadMoreButton').show()
    else $('.js-imageSearchLoadMoreButton').hide()
}

UnsplashSearchHandler.APP_ID = 'c2e962aba1fd8e5c013758468fa0eca18c818673a6cc81b656c32d084669ce15'
UnsplashSearchHandler.keywordHandlersMap = {}
UnsplashSearchHandler.lastSearchType = { 'base': {}, 'overlay': {} }
UnsplashSearchHandler.resultWidth = 50
UnsplashSearchHandler.resultHeight = 50

UnsplashSearchHandler.handleSearchByType = function(type, opts) {
    if(!opts) opts = {}
    const isFromKeyup = opts.isFromKeyup
    var keywords = opts.keywords

    if(!keywords || keywords.trim().length < 3) {
        return
    }
    keywords = keywords.trim()
    const handler = UnsplashSearchHandler.getByKeywords(keywords)
    if(isFromKeyup && handler.getNextPage() != 1 && UnsplashSearchHandler.lastSearchType[type].wasLast) {
        return
    }
    if(handler.isSearching()) {
        toggleLoadMoreButton(false)
        return
    }
    if(!handler.canSearchMore()) {
        toggleLoadMoreButton(false)
        if(handler.hasResults()) {
            return onHasExistingResults()
        }
        return $('.js-imageSearchExhausted').show()
    } else {
        $('.js-imageSearchExhausted').hide()
    }

    var endpoint = '/service/search/image/?keywords=' + keywords
    endpoint += '&page=' + handler.getNextPage()
    
    if(UnsplashSearchHandler.lastSearchType[type].keywords != keywords) {
        if(handler.hasResults()) {
            UnsplashSearchHandler.lastSearchType[type].wasLast = true
            if(handler.canSearchMore()) toggleLoadMoreButton(true)
            return handler.showAllResults(type)
        }
    }
    if(!UnsplashSearchHandler.lastSearchType[type].wasLast) {
        if(handler.hasResults()) {
            return onHasExistingResults()
        }
    }

    function onHasExistingResults() {
        UnsplashSearchHandler.lastSearchType[type].wasLast = true
        if(handler.canSearchMore()) toggleLoadMoreButton(true)
        return handler.showAllResults(type)
    }
    
    toggleLoadMoreButton(false)
    if(handler.isSearching()) {
        return
    }
    handler.startSearch()
    UnsplashSearchHandler.lastSearchType[type].keywords = keywords
    UnsplashSearchHandler.lastSearchType[type].wasLast = true

    UnsplashSearchHandler.currentHandler = handler
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

function runImageSearch(isFromKeyup) {
    UnsplashSearchHandler.handleSearchByType(UnsplashSearchHandler.ngScope.currentImageSearchType, {
        keywords: $('.js-imageSearchInput').val(),
        isFromKeyup: isFromKeyup
    })
}

UnsplashSearchHandler.attachScope = function(ngScope, ngTimeout) {
    UnsplashSearchHandler.ngScope = ngScope
    UnsplashSearchHandler.ngScopeTimeout = ngTimeout
    
    UnsplashSearchHandler.ngScope.searchImage = function(isFromKeyup) {
        runImageSearch(isFromKeyup)	
    }
    
    UnsplashSearchHandler.ngScope.getCurrentSearchHandler = function() {
        return UnsplashSearchHandler.currentHandler
    }
}

UnsplashSearchHandler.attachSearchJQueries = function(ngScope, ngTimeout) {
	$('.js-imageSearchInput').keyup((ev) => {
        var keycode = (ev.keyCode ? ev.keyCode : ev.which);
        if (keycode == '13') {
            return runImageSearch()
        }

		/*if(UnsplashSearchHandler.imageSearchTimeout) {
			clearTimeout(UnsplashSearchHandler.imageSearchTimeout)
		}
		UnsplashSearchHandler.imageSearchTimeout = setTimeout(() => {
			runImageSearch(true)
		}, 1500)	*/
    })
}