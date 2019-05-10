__**Documentation For Sound 1920**__
=====================================

**Removal of Sourcesound & Sound Distinction**

Previously, 2 types of abstractions for sound existed, __Sourcesound__ and __Sound__. They are defined as shown below.

A __Sourcesound__ is a pair(wave, duration). Wave is a mathematical function that accepts time t and returns amplitude of the wave at that time. Duration is the duration of the __Sourcesound__.

A __Sound__ is a discretized sample of audio, stored in an array.

In Sound 1920, all abstractions operate on __Sourcesound__ **only**. __Sourcesounds__ are converted to __Sound__ **only upon playing**. As __Sounds__ are never used outside of the play() function, this distinction has become obsolete. Henceforth, all __Sourcesounds__ will be renamed to __Sound__, with the following definition.

A __Sound__ is a pair(wave, duration). Wave is a mathematical function that accepts time t and returns amplitude of the wave at that time. Duration is the duration of the __Sound__.


**Improved runtime & play() function**

Previously, sound manipulation would involve many back and forth conversions between __Sourcesound__ and __Sound__, which proved to be very time-costly. As stated above, this conversion now only occurs when play() is called, resulting in a large speed up.

However, the process of converting __Sourcesounds__ into discrete samples (discretization) is inherently time-costly and thus play() may still result in an unacceptably long latency between running and playback, especially for long or complex sounds.

The new play() function utilises __WebAudio__ abstractions to solve this issue. Two __AudioBuffers__ of size 0.1 seconds are initialised. Then, the first 0.1s of the input sound is discretized and fed into the first buffer and then played by creating an __AudioBufferSourceNode__ using that buffer. While the first sample is playing, the next 0.1s sample is discretized and fed into the second buffer, then scheduled to play after the current sample ends. This implementation is reliant on the fact that second sample will be computed and ready to play before the first sample ends. Upon the end of the current sample, an __eventlistener__ triggers the discretization of the next 0.1s into the buffer of the ended sample and schedules it to play after the current sample. To maintain space-efficiency, only two buffers are created and utilised however a new __AudioBufferSourceNode__ is necessarily created for each sample as is intended by the __WebAudio__ API. This buffering method results in virtually zero wait time between running and playback.


**Introduction of play_safe()**

While the new play() function solves the latency issue, it is unsuitable for extremely complex sounds, where the processing time (discretization time) is longer than the length of the sample. The sound becomes "choppy" and begins to "stutter". A check could be added to detect this and prompt the user to use play_safe() instead to play their sound.

The play_safe() function discretizes the whole sound before playback (similar to the older implementation of play()). This circumvents the above issue but reintroduces the previous issue of latency between running and playback. However, more testing is required to determine if this is still an issue in the Native implementation of the Source Academy which features massively improved performance.

**Microphone Recording**

Recording of sound input from student's microphone is available in Sound 1920. This section details the usage of the abstractions available.

To begin microphone recording, init_record() must be called to grant access to user's microphone. record_for(duration) begins a sound recording that lasts for the specified duration. This
sound is saved to a global 'recorded_sound' variable. Alternatively, for more precise control of exactly when to start and stop and recording, start_record() and stop_record() may be called.


**Known Bugs & Issues**

The following are known issues with the current implementation of Sound 1920 as of 19 April 2019.

-Both play() and play_safe() return undefined instead of throwing an error when given a non-sound list or pair.

-Sound 1920 appears to be buggy for Mac OS / Safari Browser. More testing required. Recommend Firefox / Chrome instead.

-Microphone sound is not working on Chrome on Mac OS and Windows. It is suspected to be due to a security issue.

-Multiple calls to record_for() in the Source Academy has unknown behaviour. It must be called one by one on the REPL instead.


**Future Plans / Improvements**

-Prompt user to use play_safe() when sound is too complex for normal play().

-Prompt user to save their work before pressing play_safe().

-play_safe() "remembers" and immediately plays back the input sound if no changes were made since last run, in order to save processing time.

-Prompt user to run init_record if microphone abstractions are called.

-Further improvement of discretize function by using workers or multi-threading.
