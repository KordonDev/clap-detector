// Require the module
const clapDetector = require('./index.js');

// Define configuration
var clapConfig = {};

// Start clap detection
clapDetector.start(clapConfig);

// Register on clap event
clapDetector.onClap(function(history) {
    console.log('your callback code here ');
    console.dir(history);
});

// Register to a series of 3 claps occuring within 2 seconds
clapDetector.onClaps(3, 2000, function(delay) {
    //console.log('your callback code here ');
});

