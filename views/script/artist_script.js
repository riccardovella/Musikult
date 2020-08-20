var url = new URL(window.location.href);
var token = url.searchParams.get("access_token");
//animation for best songs
$(document).ready(function() {
    $(".song-div").mouseenter(function(){
        $(this).css("background-color", "rgba(143, 143, 143, 0.199)");
    });
    $(".song-div").mouseleave(function(){
        $(this).css("background-color", "rgba(143, 143, 143, 0)");
    });
    //redirecting to selected song page with the token if you logged in or without token if not
    $(".song-div").click(function() {
        if(token)
            window.location.href = "http://localhost:3000/songs?access_token=" + token + "&id=" + $(this).attr("id");
        else
            window.location.href = "http://localhost:3000/songs?id=" + $(this).attr("id");
    });
});

var body = document.body,
    html = document.documentElement;
var width = Math.max(body.offsetWidth, html.clientWidth, html.offsetWidth);

var n = 33;
var maxn = (parseInt($(".flex-row").attr("number")))*300 - width + 300;

//animation to move right or left on releated artists
$(document).ready(function() {
    //for each the row scrolls for 600px
    $(".left").click(function() {
        if(n < 33) {
            n += 600;
            $(".related-artists-row").animate({
                left: n + "px",
            });
        }
    });
    $(".right").click(function() {
        if(n > -maxn + 33) {
            n -= 600;
            $(".related-artists-row").animate({
                left: n + "px",
            });
        }
    });
    //animation for releated artists buttons(right and left)
    $(".left").mouseenter(function() {
        $(this).css("background-color", "rgba(128, 128, 128, 0.750)");
        $(this).children("p").css("font-size", "34px");
        $(this).children("p").css("padding-top", "60px");
        $(this).children("p").css("color", "rgba(80, 80, 80, 0.8)");
    });
    $(".right").mouseenter(function() {
        $(this).css("background-color", "rgba(128, 128, 128, 0.750)");
        $(this).children("p").css("font-size", "34px");
        $(this).children("p").css("padding-top", "60px");
        $(this).children("p").css("color", "rgba(80, 80, 80, 0.8)");
    });
    $(".left").mouseleave(function() {
        $(this).css("background-color", "rgba(128, 128, 128, 0.550)");
        $(this).children("p").css("font-size", "30px");
        $(this).children("p").css("padding-top", "62px");
        $(this).children("p").css("color", "rgba(116, 116, 116, 0.6)");
    });
    $(".right").mouseleave(function() {
        $(this).css("background-color", "rgba(128, 128, 128, 0.550)");
        $(this).children("p").css("font-size", "30px");
        $(this).children("p").css("padding-top", "62px");
        $(this).children("p").css("color", "rgba(116, 116, 116, 0.6)");
    });
    //animation on a single releated artist
    $(".related-artist").mouseenter(function() {
        $(this).children(".related-artist-img").css({
            filter: "brightness(50%)",
        })
        $(this).children(".related-artist-text").show();
    });
    $(".related-artist").mouseleave(function() {
        $(this).children(".related-artist-img").css({
            filter: "brightness(100%)",
        })
        $(this).children(".related-artist-text").hide();
    });
    //redirect to the selected releated artist page 
    $(".related-artist").click(function() {
        window.location.href = "http://localhost:3000/artists" + "?access_token=" + token + "&" + "id=" + $(this).attr("id") + "s";
    });
    
});