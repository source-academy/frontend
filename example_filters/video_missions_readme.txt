How to use
- go to Playground
- click on the "camera" icon on the right side of the screen
- click the "play" icon, and give permission for access to your webcam
- choose "VIDEO" from the dropdown list of external libraries
- copy-paste code from the example files and run
- tada~~

(other functions)
- clicking on "pause" icon will pause the video, clicking on "play" icon again will resume it
- clicking "Reset filter" will remove the effect of any filter you applied
- after editing the dimensions and clicking on "Update video dimensions", you will be asked to give permission for webcam again
    - also, the filter is reset automatically, so run your code again
    - note: making the video dimensions large will cause your frame rate to drop




Abstractions
    Image
        - a 2D array of pixels

    Filter
        - a function that takes in two images, src & dest, and writes to dest
        - students are to use provided functions such as 
            - "set_rgb(dest[x][y], redVal, greenVal, blueVal);"
            - "copy_pixel(src[x][y], dest[x][y])"
            instead of doing "dest[x][y] = src[x][y]" , as this will cause errors





Documentation of all video library functions
(refer to examples for better understanding of usage)
(can get students to define their own versions of library functions as missions)
    
    red_of(px)
    green_of(px)
    blue_of(px)
        returns the red, green, blue values of px respectively

    set_rgb(px, r, g, b)
        assigns the r,g,b values to this px

    copy_pixel(src_px, dest_px)
        sets the rgb values of dest_px to the same as src_px

    copy_image(src, dest)
        a filter which does not do anything
        every pixel in dest will be set to the same rgb values as its corresponding pixel in src

    constrain_color(val)
        constrains val such that 0 <= val <= 255

    compose_filter(filter1, filter2)
        returns a new filter that will have the effect of applying filter1 first and then filter2

    pixel_similar(px1, px2, threshold)
        returns true if the absolute difference in red( and green and blue) value of px1 and px2 is smaller than the threshold value

    currentFrameRuntime()
        returns the number of milliseconds passed since (you know when) at the start of this frame
        for usage in time-dependent filters
        since each frame takes non-negligible milliseconds to compute

    getTempArray()
        returns an array that can be used to store temporary values
        this array retains its values from frame to frame

    getVideoWidth()
        returns the width of the video
        ie the number of pixels in the horizontal direction

    getVideoHeight()
        returns the height of the video
        ie the number of pixels in the vertical direction

    apply_filter(my_filter)
        changes the current filter to my_filter
        default filter is copy_image




    make_distortion_filter(reverse_mapping)
    make_static_distortion_filter(reverse_mapping)
        distortion
            a rearrangement of the pixels in the original src
        reverse_mapping([x,y])
            this is a function that takes in [x,y], which are the coordinates of a pixel on dest
            and returns [u,v], the coordinates of a pixel on src
        These two functions will return a filter that will
            map every pixel - dest[x][y] for all x,y - to take the rgb values of src[u][v]
            if [u,v] exceeds the boundaries of src, a black pixel will be displayed instead
    
        make_static_distortion_filter
            for filters that will not change with time
            the pixel mappings are only calculated once
        make_distortion_filter
            for filters that will change with time
            the pixel mappings are recalculated in every frame (can become unbearably slow :/ )




More things to do
    speed improvements for time-dependent filters (if possible)
    UI improvements
    p5.js library is awesome, potential for more exciting graphics missions
    error handling




