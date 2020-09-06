
//animation on favourite artists card and redirect to the selected artist
$(document).ready(function(){
    $(".artist-card").mouseenter(function() {
        $(this).children(".card-img").css({
                filter: "brightness(50%)",
        });
        $(this).children(".card-title").show();
    });
    $(".artist-card").mouseleave(function() {
        $(this).children(".card-img").css({
                filter: "brightness(100%)",
        });
        $(this).children(".card-title").hide();
    });
    $(".artist-card").click(function() {
        redirect("/artists", "id=" + $(this).attr("artist-id") + "s");
    });

});
//animation on favourite songs cards and redirect to the selected song
$(document).ready(function(){
    $(".song-card").mouseenter(function() {
        $(this).children(".card-img").css({
                filter: "brightness(50%)",
        });
        $(this).children(".card-title").show();
        $(this).children(".card-subtitle").show();
    });
    $(".song-card").mouseleave(function() {
        $(this).children(".card-img").css({
                filter: "brightness(100%)",
        });
        $(this).children(".card-title").hide();
        $(this).children(".card-subtitle").hide();
    });
    $(".song-card").click(function() {
        var artist=$(this).attr("artist-name");
        var song=$(this).attr("song-name");
        geniusRef(artist, song);
        
    });
});
//animation on carousel and redirect to the selected song 
$(document).ready(function() {
    $(".carousel").mouseenter(function() {
        $(this).children(".carousel-inner").children().each(function() {
            $(this).children("img").css({
                filter: "brightness(50%)",
            })
        })
    })
    $(".carousel").mouseleave(function() {
        $(this).children(".carousel-inner").children().each(function() {
            $(this).children("img").css({
                filter: "brightness(100%)",
            })
        })
    })
    $(".carousel-item").click(function() {
        var artist=$(this).children("div").children("p").text();
        var song=$(this).children("div").children("h5").text();
        geniusRef(artist, song);
    })
})




