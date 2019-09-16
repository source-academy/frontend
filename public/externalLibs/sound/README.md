To describe a Sound, you need a wave function, and the duration of the Sound in seconds.
The wave function takes a non-negative time *t* (in seconds) as argument and returns the amplitude
of the wave
(a number between -1 and 1) at time *t*. In this library, we assume that as duration of a sound
a non-negative number is given. An example wave function `my_wave` has this type:

`my_wave` : Number → Number

The following constructor and accessor functions are given:

```
function make_sound(wave, duration) {
    return pair(wave, duration);
}

function get_wave(sound) {
    return head(sound);
}

function get_duration(sound) {
    return tail(sound);
}
```

As usual, make sure you do not break the data abstraction of a Sound and always use these
functions to make and access Sounds.

To try things out, you are given a function

`noise_sound` : Number → Sound

where the given Number is the duration of the noisy Sound to be created, in seconds.

The `play` function has the type:

`play` : Sound → Sound

because it returns the given Sound, in addition to playing it using your computer's audio system.

**Warning: In the following, we produce Sounds that might be very loud! Turn down the volume of
your speakers before you attempt to play Sounds, especially in a public place or if you are wearing
headphones.**

You can test and play the following:

```
play(noise_sound(0.5));
```

after which you should hear half a second of noise. (If you don't, your browser does not support sound; use a different one or ask your Avenger for advice).

### Sound Property

The `make_sound` constructor ensures that all Sounds have the following property:
```
(get_wave(sound))(get_duration(sound) + t) === 0
```
for any number `t` ≥ 0, regardless what the original wave of the Sound returns for `t`.
The wave will simply return 0 when the duration is up.
This Sound property removes the need to explicitly change the wave function when
the duration of a Sound changes.

