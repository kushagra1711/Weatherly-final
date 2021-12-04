function onk() {
    if (isonk) {
        document.getElementsByClassName("overlayLister")[0].style.display = "block";
        document.getElementById("hamburger").src = "assets/x.png";
    } else {
        document.getElementsByClassName("overlayLister")[0].style.display = "none";
        document.getElementById("hamburger").src = "assets/hamburger.png";
    }
    isonk = !isonk;
}

var isonk = true;
