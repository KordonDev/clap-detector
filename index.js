/**
 * Copyright (c) 2015 Thomas Schell (https://github.com/tom-s)



 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to dealFWAV_
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:



 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.



 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 */

const exec = require('child_process').exec;
const fs = require('fs');
const appRoot = require('app-root-path');
const os = require('os');

const audioDetector = (function() {
    /* DEFAULT CONFIG */
    const CONFIG = {
        AUDIO_SOURCE: os.type() === "Darwin" // microphone
        ? 'coreaudio default'
        : 'alsa hw:1,0',
        MAX_HISTORY_LENGTH: 10, // no need to maintain big history
        DETECTION_PERCENTAGE_START : '10%',
        DETECTION_PERCENTAGE_END: '10%',
        AUDIO_DETECTION:  {
            MAX_DURATION: null,
            MIN_DURATION: null,
            MAX_MAXIMUM_AMPLITUDE: null,
            MIN_MAXIMUM_AMPLITUDE: null,
            MAX_MINIMUM_AMPLITUDE: null,
            MIN_MINIMUM_AMPLITUDE: null,
            MAX_MID_AMPLITUDE: null,
            MIN_MID_AMPLITUDE: null,
            MAX_MEAN_NORM: null,
            MIN_MEAN_NORM: null,
            MAX_MEAN_AMPLITUDE: null,
            MIN_MEAN_AMPLITUDE: null,
            MIN_RMS_AMPLITUDE: null,
            MAX_RMS_AMPLITUDE: null,
            MAX_MAXIMUM_DELTA: null,
            MIN_MAXIMUM_DELTA: null,
            MAX_MINIMUM_DELTA: null,
            MIN_MINIMUM_DELTA: null,
            MAX_MEAN_DELTA: null,
            MIN_MEAN_DELTA: null,
            MAX_RMS_DELTA: null,
            MIN_RMS_DELTA: null,
            MAX_FREQUENCY: null,
            MIN_FREQUENCY: null,
            MAX_VOLUME_ADJUSTMENT: null,
            MIN_VOLUME_ADJUSTMENT: null,
        }
    };

    let paused = false;

    /* Callback for events */
    const EVENTS = {
        detection: {
            fn: null,
        },
        multipleDetections: []
    };

    /* History of detections */
    let detectionsHistory = [];

    function _handleMultipleDetectionsEvent(props) {
        // Retrieve latest detection
        const latestDetections = detectionsHistory.slice(props.num * -1);
        if(latestDetections.length === props.num) {
            // Check that the delay between the last detection and the first is inferior to what was requested by user
            const lastDetection = latestDetections.slice(-1)[0];
            const firstDetection = latestDetections.slice(0,1)[0];
            const delay = lastDetection.time - firstDetection.time;
            if(delay < props.maxDelay) {
                props.fn(delay);
            }
        }
    }

    /* Check if multiple detections have been done */
    function _handleMultipleDetections() {
        // If callback registered, handle them
        if(EVENTS.multipleDetections.length > 0) {
            EVENTS.multipleDetections.forEach(_handleMultipleDetectionsEvent)
        }
    }

    /* Listen */
    function _listen() {
        const args = [];
        let body  = '';

        const filename = appRoot + '/input.wav';

        // Listen for sound
        const cmd = 'sox -t ' + CONFIG.AUDIO_SOURCE + ' ' + filename + ' silence 1 0.0001 '  + CONFIG.DETECTION_PERCENTAGE_START + ' 1 0.1 ' + CONFIG.DETECTION_PERCENTAGE_END + ' −−no−show−progress stat';
       
        const child = exec(cmd);

        child.stderr.on("data", function(buf){ 
            body += buf; 
        });

        child.on("exit", function() {
            
            const stats = _parse(body);
            if (_isSoundDetected(stats)) {

                detectionsHistory.push({
                    id  : (detectionsHistory.length) ? detectionsHistory.slice(-1)[0].id + 1 : 1,
                    time: new Date().getTime()
                });

                // Clean history
                detectionsHistory = detectionsHistory.slice(CONFIG.MAX_HISTORY_LENGTH * -1); // no need to maintain a big history

                if(EVENTS.detection.fn) {
                    EVENTS.detection.fn(detectionsHistory);
                }
                _handleMultipleDetections();
            }

             _listen(); // listen again

        });
    }

    function checkMinimum(minimum, measuredValue) {
        return minimum === undefined || minimum <= measuredValue;
    }
    function checkMaximum(maximum, measuredValue) {
        return maximum === undefined || maximum >= measuredValue;
    }

    function _isSoundDetected(measurements) {
        const audioDetection = CONFIG.AUDIO_DETECTION;
        return checkMaximum(audioDetection.MAX_DURATION, measurements.duration)
            && checkMinimum(audioDetection.MIN_DURATION, measurements.duration)
            && checkMaximum(audioDetection.MAX_MAXIMUM_AMPLITUDE, measurements.maximumAplitude)
            && checkMinimum(audioDetection.MIN_MAXIMUM_AMPLITUDE, measurements.maximumAplitude)
            && checkMaximum(audioDetection.MAX_MINIMUM_AMPLITUDE, measurements.minimumAmplitude)
            && checkMinimum(audioDetection.MIN_MINIMUM_AMPLITUDE, measurements.minimumAmplitude)
            && checkMaximum(audioDetection.MAX_MID_AMPLITUDE, measurements.midAmplitude)
            && checkMinimum(audioDetector.MIN_MID_AMPLITUDE, measurements.midAmplitude)
            && checkMaximum(audioDetector.MAX_MEAN_NORM, measurements.meanNorm)
            && checkMinimum(audioDetector.MIN_MEAN_NORM, measurements.meanNorm)
            && checkMaximum(audioDetector.MAX_MEAN_AMPLITUDE, measurements.meanAmplitude)
            && checkMinimum(audioDetector.MIN_MEAN_AMPLITUDE, measurements.meanAmplitude)
            && checkMaximum(audioDetector.MAX_RMS_AMPLITUDE, measurements.rmsAmplitude)
            && checkMinimum(audioDetector.MIN_RMS_AMPLITUDE, measurements.rmsAmplitude)
            && checkMaximum(audioDetector.MAX_MAXIMUM_DELTA, measurements.maximumDelta)
            && checkMinimum(audioDetector.MIN_MAXIMUM_DELTA, measurements.maximumDelta)
            && checkMaximum(audioDetector.MAX_MINIMUM_DELTA, measurements.minimumDelta)
            && checkMinimum(audioDetector.MIN_MINIMUM_DELTA, measurements.minimumDelta)
            && checkMaximum(audioDetector.MAX_MEAN_DELTA, measurements.meanDelta)
            && checkMinimum(audioDetector.MIN_MEAN_DELTA, measurements.meanDelta)
            && checkMaximum(audioDetector.MAX_RMS_DELTA, measurements.rmsDelta)
            && checkMinimum(audioDetector.MIN_RMS_DELTA, measurements.rmsDelta)
            && checkMaximum(audioDetector.MAX_FREQUENCY, measurements.frequency)
            && checkMinimum(audioDetector.MIN_FREQUENCY, measurements.frequency)
            && checkMaximum(audioDetector.MAX_VOLUME_ADJUSTMENT, measurements.volumeAdjustment)
            && checkMinimum(audioDetector.MIN_VOLUME_ADJUSTMENT, measurements.volumeAdjustment)
  }

    function _parse(body) {
        body = body.replace(new RegExp("[ \\t]+", "g") , " "); //sox use spaces to align output
        const split = new RegExp("^(.*):\\s*(.*)$", "mg");
        let match;
        const dict = {}; //simple key:value
        while (match = split.exec(body)) {
            dict[match[1]] = parseFloat(match[2]);
        }

        return {
            duration: dict['Length (seconds)'],
            maximumAplitude: dict['Maximum amplitude'],
            minimumAmplitude: dict['Minimum amplitude'],
            midAmplitude: dict['Midline amplitude'],
            meanNorm: dict['Mean norm'],
            meanAmplitude: dict['Mean amplitude'],
            rmsAmplitude: dict['RMS amplitude'],
            maximumDelta: dict['Maximum delta'],
            minimumDelta: dict['Minimum delta'],
            meanDelta: dict['Mean delta'],
            rmsDelta: dict['RMS delta'],
            frequency: dict['Rough frequency'],
            volumeAdjustment: dict['Volume adjustment'],
        };
    }

    function _config(props) {
        if(props) {
            Object.assign(CONFIG, props);
        }
    }

    return {
        start: function (props) {
            _config(props);

            // Start listening
            _listen();
        },

        // single detection
        onDetection: (cb) => {
            if(cb) {
                EVENTS.detection.fn = cb;
            }
        },

        // multiples detections
        onDetections: (num, maxDelay, cb) => {
            if(num && maxDelay && cb) {
                EVENTS.multipleDetections.push({
                    num: num,
                    maxDelay: maxDelay,
                    fn: cb
                });
            }
        },

        // pause
        pause: () => paused = true,

        // resume
        resume: () => paused = false,

        // updateConfig
        updateConfig: (props) => _config(props)
    };
})();

module.exports = audioDetector;
