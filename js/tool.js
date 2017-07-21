function uploadOverlayImage() {
    var preview = document.getElementById('image-upload'); //selects the query named img
    var file    = document.querySelector('input[type=file]').files[0]; //sames as here
    var reader  = new FileReader();

    reader.onloadend = function () {
        preview.src = reader.result;
        $('#download-button').css('display','block')
        $('#final-image-canvas').html('')

        $("#image-opacity-input").change(function() {
        $('#image-overlay').fadeTo( "slow" , $("#image-opacity-input").val(), function() {
            // Animation complete.
        });
        });
    }

    if (file) {
        reader.readAsDataURL(file); //reads the data as a URL
    } else {
        preview.src = "";
    }
}

function uploadBaseImage() {
    var preview = document.getElementById('image-upload'); //selects the query named img
    var file    = document.querySelector('input[type=file]').files[0]; //sames as here
    var reader  = new FileReader();

    reader.onloadend = function () {
        preview.src = reader.result;
        $('#download-button').css('display','block')
        $('#final-image-canvas').html('')

        $("#image-opacity-input").change(function() {
        $('#image-overlay').fadeTo( "slow" , $("#image-opacity-input").val(), function() {
            // Animation complete.
        });
        });
    }

    if (file) {
        reader.readAsDataURL(file); //reads the data as a URL
    } else {
        preview.src = "";
    }
}

$(function() { 
    $("#download-button").click(function() { 
    setTimeout(function(){$("#show-final-image-modal").click()},5)

    html2canvas($("#final-image-container"), {
        onrendered: function(canvas) {
            theCanvas = canvas;
            document.getElementById('final-image-canvas').innerHTML = '';
            document.getElementById('final-image-canvas').appendChild(canvas);

            canvas.toBlob(function(blob) {
            saveAs(blob, "BlackLivesMatter-Ally-ProfilePic.png"); 
            });
        }
    });
    });
});