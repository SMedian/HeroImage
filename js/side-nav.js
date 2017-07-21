/* Set the width of the side navigation to 250px and the left margin of the page content to 250px and add a black background color to body */
function openSideNav() {
    document.getElementById("side-nav").style.width = "250px";
    document.body.style.backgroundColor = "rgba(0,0,0,0.4)";
}

/* Set the width of the side navigation to 0 and the left margin of the page content to 0, and the background color of body to white */
function closeSideNav() {
    document.getElementById("side-nav").style.width = "0";
    document.body.style.backgroundColor = "white";
}

function toggleSideNav() {
    const width = document.getElementById("side-nav").style.width
    if(width != '250px') {
        openSideNav()
    } else {
        closeSideNav()
    }
}