const spotify = require("./spotify");

const Error = function (response, source) {
    return {
        statusCode     : response.statusCode,
        statusMessage  : response.statusMessage,
        date           : response.headers.date,
        source         : source
    }
};

const display = function (error) {
    console.log("[" + error.source.toUpperCase() + " ERROR]: " + error.statusCode + " " + error.statusMessage + "\nDate: " + error.date + "\n");
}

exports.Error = Error;

exports.display = display;