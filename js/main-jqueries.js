$.fn.pressedEnter = function(fn) {  
    return this.each(function() {  
        $(this).bind('enterPress', fn);

        $(this).keyup(function(e){
            if(e.keyCode == 13)
            {
              $(this).trigger("enterPress");
            }
        })
    });  
};

$.fn.isEmptyInput = function(fn) {  
    return this.each(function() {  
        $(this).bind('inputIsEmpty', fn);

        $(this).keyup(function(e){
            var value = $(this).val()
            if(!value || value.trim().length < 1)
            {
              $(this).trigger("inputIsEmpty");
            }
        })
    });  
};

$.loadScript = function (url, callback) {
    $.ajax({
        url: url,
        dataType: 'script',
        success: callback,
        async: true
    });
}

$(document).ready(function(){

    $(".hide-parent-x").click(function(){
    	//get the parent of this and hide it
    	var parent = $(this).parent();
    	parent.hide();
    });

    $("#nav-user-open-settings").click(function(){
    	setBrowserHash("#settings");
    	$("#settings-container").show();
    	$('#settings-container').showHider();
    });

    $("#nav-user-open-about").click(function(){
    	setBrowserHash("#about");
    	$("#about-container").show();
    	$('#about-container').showHider();
    });

    $("a[href='#top']").click(function() {
	  $("html, body").animate({ scrollTop: 0 }, "slow");
	  return false;
	});

    $(".js-toTop").click(function() {
	  $("html, body").animate({ scrollTop: 0 }, "slow");
	  return false;
	});

	$(".nav-link").click(function(){
		var navbarMobileToggle = document.getElementById("nav-mobile-toggle");
		if(navbarMobileToggle && navbarMobileToggle.style.display != 'none') {
			//hide the navbar
			$('#navbar').hide();
		}
	});

    $('.js-toggleNav').click(() => {
        toggleSideNav()
        event.stopPropagation();
    })

    $('.js-openNav').click((event) => {
        openSideNav()
        event.stopPropagation();
    })
    $('.js-closeNav').click(() => {
        closeSideNav()
    })

    $('#site-main').click(() => {
        closeSideNav()
    });
});