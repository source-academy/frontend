The PIX&FLIX library allows us to process still images and video.
Each image is a two-dimensional array of Pixels, and a Pixel
consists of red, blue and green color values, each ranging between
0 and 255. To access these color values of a Pixel, we provide the
functions `red_of`, `blue_of` and `green_of`.

A central element of PIX&FLIX is the notion of a *filter*, 
a function that is applied to two images: 
the source image and the destination image. We can install
a given filter to be used to transform
the images that the camera captures into images
displayed on the output screen by using the function `apply_filter`.
The output screen is shown in the Source Academy in the tab with
the "camera" icon.

The size of the output screen can be changed by the user. To access
the current size of the output screen, we provide the functions
`get_video_height` and `get_video_width`.
