Audio detection module for node js
===

## Synopsis

AudioDetecor is a audio detection module for nodejs. It can detects short audios like claps or peeping and allows you to trigger callbacks whenever these events happen. It can also trigger on a sequence of detected audios.

## Requirements
This module works on linux based OS (raspbian, Ubuntu, Debian...) using alsa for audio and a working microphone or Mac OS X using coreaudio.

## Installation

This module requires sox, "the Swiss Army knife of sound processing programs" (http://sox.sourceforge.net/) to be installed
### Linux
```bash
sudo apt-get install sox
```
### Mac OS X
```bash
brew install sox
```

### npm install
You can simply add this module to your node.js project with
```bash
// sudo might be required depending on your system
npm install --save clap-detector
```

## Usage

An example how to use this is in [`clapExample.js`](https://github.com/KordonDev/clap-detector/blob/master/clapExample.js)

There are four public methods you can use:
- audioDetector.start(config);
=> this needs to be called to initialize audio detection. The config object is mandatory to configure the detection of the audio.
- audioDetector.onDetecton(yourcallbackfunctionhere)
=> register a callback that will be triggered whenever the specified audio is detected. Your callback can accept an array of ids counting each clap and the corresponding timestamp.
- audioDetector.onDetections(numberOfDetections, delay, yourcallbackfunctionhere)
=> register a callback that will be triggered whenever a series of audio detections (determined by the number of detections) is detected within the period of time you've specified (delay).
- audioDetector.updateConfig(config);
=> updates configuration on-the-fly.

## Configuration

You can pass a configuration object at the initialisation time (clapDetector.init(yourConfObject)). If you don't the following config will be used. You should at least provide the audio input (if different from the default config).

```bash
// DEFAULT CONFIG
var CONFIG = {
        AUDIO_SOURCE: 'hw:1,0', // this is your microphone input. If you don't know it you can refer to this thread (http://www.voxforge.org/home/docs/faq/faq/linux-how-to-determine-your-audio-cards-or-usb-mics-maximum-sampling-rate)
        DETECTION_PERCENTAGE_START : '5%', // minimum noise percentage threshold necessary to start recording sound
        DETECTION_PERCENTAGE_END: '5%',  // minimum noise percentage threshold necessary to stop recording sound
        MAX_HISTORY_LENGTH: 10 // all claps are stored in history, this is its max length
        AUDIO_DETECTION: { // all these configuration is the output from sox, you can read about it in the sox man page
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
```

To find your configuration for your audio, use sox to generate the stats and find suitable parameters for you

## Fork
This is a fork of the [clap-detector](https://github.com/tom-s/clap-detector) which is more generalized.

## License

clap-detector is dual licensed under the MIT license and GPL.
For more information click [here](https://opensource.org/licenses/MIT).
