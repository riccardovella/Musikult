const express = require('express');
const app = express();

// import global variables
require('dotenv').config();

app.use(express.static('views'));
app.use(require('./controllers'));

// set the view engine to ejs
app.set('view engine', 'ejs');

app.listen(process.env.SERVER_PORT, () => {
    console.log("Server listening on port " + process.env.SERVER_PORT);
});


