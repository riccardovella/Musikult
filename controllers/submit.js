const express = require("express");
const bodyparser = require("body-parser");

const db = require("../utilities/db.js");

var router = express.Router();

// Used to take data from the form
router.use(bodyparser.urlencoded({extended: true}));
 
router.post('/', function(req, res) {
    var access_token = req.query.access_token;
    var type = req.query.type;

    if(type == "lyrics") {

        db.insertLyrics(req.query.id, req.body.lyrics);

        if(access_token) {       
            res.render('thankPage', {
                id: req.query.id,
                isLogged: true
            });
        }
        else {
            res.render('thankPage', {
                id: req.query.id, 
                isLogged: false
            });
        }
    }

    else if(type == "timestamps") {
        db.insertTimestamps(req.query.id, req.body.timestamps);
    }

});

module.exports = router;