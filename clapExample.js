// Require the module
const audioDetector = require('./index.js');

// Define configuration
var clapConfig = {
    AUDIO_DETECTION: {
        MAX_DURATION: 1500,
        MIN_MAXIMUM_AMPLITUDE: 0.7,
        MAX_RMS_AMPLITUDE: 0.3,
    }
};

// Start clap detection
audioDetector.start(clapConfig);

// Register on clap event
audioDetector.onDetection(function(history) {
    console.log('your callback code here ');
    console.dir(history);
});

// Register to a series of 3 claps occuring within 2 seconds
audioDetector.onDetections(3, 2000, function(delay) {
    console.log('your callback code here for multiple claps');
});

