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

const clapDetector = (function() {
    /* DEFAULT CONFIG */
    const CONFIG = {
        AUDIO_SOURCE: os.type() === "Darwin" // microphone
        ? 'coreaudio default'
        : 'alsa hw:1,0',
        DETECTION_PERCENTAGE_START : '10%',
        DETECTION_PERCENTAGE_END: '10%',
        CLAP_AMPLITUDE_THRESHOLD: 0.7,
        CLAP_ENERGY_THRESHOLD: 0.3,
        CLAP_MAX_DURATION: 1500,
        MAX_HISTORY_LENGTH: 10 // no need to maintain big history
    };

    let paused = false;

    /* Callback for events */
    const EVENTS = {
        clap: {
            fn: null,
        },
        multipleClaps: []
    };

    /* History of claps */
    let clapsHistory = [];

    function _handleMultipleClapsEvent(props) {
        // Retrieve latest claps
        const latestClaps = clapsHistory.slice(props.num * -1);
        if(latestClaps.length === props.num) {
            // Check that the delay between the last clap and the first is inferior to what was requested by user
            const lastClap = latestClaps.slice(-1)[0];
            const firstClap = latestClaps.slice(0,1)[0];
            const delay = lastClap.time - firstClap.time;
            if(delay < props.maxDelay) {
                props.fn(delay);
            }
        }
    }

    /* Check if multiple claps have been done */
    function _handleMultipleClaps() {
        // If callback registered, handle them
        if(EVENTS.multipleClaps.length > 0) {
            EVENTS.multipleClaps.forEach(_handleMultipleClapsEvent)
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
            if(_isClap(stats)) {

                clapsHistory.push({
                    id  : (clapsHistory.length) ? clapsHistory.slice(-1)[0].id + 1 : 1,
                    time: new Date().getTime()
                });

                // Clean history
                clapsHistory = clapsHistory.slice(CONFIG.MAX_HISTORY_LENGTH * -1); // no need to maintain a big history

                if(EVENTS.clap.fn) {
                    EVENTS.clap.fn(clapsHistory);
                }
                _handleMultipleClaps();
            }

             _listen(); // listen again

        });
    }

    function _isClap(stats) {

        const duration = stats['Length (seconds)'],
        rms      = stats['RMS amplitude'],
        max      = stats['Maximum amplitude'];

        return (duration < CONFIG.CLAP_MAX_DURATION && max > CONFIG.CLAP_AMPLITUDE_THRESHOLD && rms < CONFIG.CLAP_ENERGY_THRESHOLD);
    }

    function _parse(body) {
        body = body.replace(new RegExp("[ \\t]+", "g") , " "); //sox use spaces to align output
        const split = new RegExp("^(.*):\\s*(.*)$", "mg");
        let match;
        const dict = {}; //simple key:value
        while (match = split.exec(body)) {
            dict[match[1]] = parseFloat(match[2]);
        }
        return dict;
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

        //1 clap
        onClap: (cb) => {
            if(cb) {
                EVENTS.clap.fn = cb;
            }
        },

        // multiples claps
        onClaps: (num, maxDelay, cb) => {
            if(num && maxDelay && cb) {
                EVENTS.multipleClaps.push({
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

module.exports = clapDetector;
