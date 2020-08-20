const express = require("express");
const bodyparser = require('body-parser');

const genius = require("../../utilities/genius.js");
const db = require("../../utilities/db.js");

var router = express.Router();

// Used to take data from the form
router.use(bodyparser.urlencoded({extended: false}));

/************************************************************************
    API DOCUMENTATION
*/

router.get('/', function(req, res) {
    res.sendFile('api.html', {root: __dirname });
});

/************************************************************************

/************************************************************************      
    API USED TO GET LYRICS OF A SONG 

    Query parameters
      Name 	           |    Description
      ------------------------------------------------------------
      id* Integer      |    pass the track's id        Required

    Responses
      Status: 200 - search results matching criteria
      Status: 400 - bad input parameter 
      Status: 404 - no result found

*/

router.get('/lyrics', function(req, res) {

    var id = req.query.id;
    if(isNaN(id)) 
        res.status(400).send("Invalid Parameters");

    else {
        db.getLyrics(id, function(lyrics, timestamps) {
            if(!lyrics) 
                res.status(404).send("Not Found");
            else {
                res.status(200).json({
                    id: id,
                    lyrics: lyrics,
                    timestamps: timestamps,
                });
            }
        });
    }
});

/************************************************************************

/************************************************************************
    CREATE LYRICS IN THE DATABASE

    Body parameters
      Name 	            |    Description
      -----------------------------------------------------------
      lyrics 	        |  {    id:          integer (int32)   
                        |       lyrics:      string            }

    Responses
      Status: 201 - lyrics added
      Status: 400 - invalid input, object invalid
      Status: 409 - lyrics already exists 

*/

router.post('/lyrics', function(req, res) {
    
    var id = req.body.id;
    var lyrics = req.body.lyrics;

    if(isNaN(id) || !lyrics) 
        res.status(400).send("Invalid Parameters");

    else {
        db.insertLyricsAPI(id, lyrics, function(err) {
            if(err) {
                console.log(err);
                res.status(409).send("Already exists");
            }
            else {
                res.status(201).send("Added");
            }
        });
    }
});

/************************************************************************

/************************************************************************
    API USED TO DELETE LYRICS OF A SONG 

    Query parameters
      Name 	           |    Description
      ------------------------------------------------------------
      id* Integer      |    pass the track's id        Required

    Responses
      Status: 200 - search results matching criteria
      Status: 400 - bad input parameter 
      Status: 404 - no result found
*/

router.delete('/lyrics', function(req, res) {

    var id = req.query.id;
    if(isNaN(id)) 
        res.status(400).send("Invalid Parameters");

    else {
        db.deleteLyrics(id, function(err) {
            if(err) 
                res.status(404).send("Not Found");
            else {
                res.status(200).send("OK");
            }
        });
    }

});

/************************************************************************
    GETS A TRACK 

    Query parameters
      Name 	            |    Description
      -----------------------------------------------------------
      track* String		|    pass the track's name      Required
      artist* String    |    pass the artist's name     Required

    Responses
      Status: 200 - search results matching criteria 
      Status: 400 - bad input parameter 
      Status: 404 - no result found

*/

router.get('/tracks', function(req, res) {

    var track = req.query.track;
    var artist = req.query.artist;

    if(!track || !artist) 
        res.status(400).send("Invalid Parameters");

    else {
        genius.geniusSearch(track + " " + artist, function(result) {
            if(!result || result.songs[0] == null) 
                res.status(404).send("Not Found");
            else 
                res.status(200).json({
                    id: result.songs[0].id,
                    name: result.songs[0].name,
                    artist: result.songs[0].artist,
                    imgUrl: result.songs[0].photo
                });
        });
    }
});

/************************************************************************/

module.exports = router;