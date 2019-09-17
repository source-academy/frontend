The CURVES library includes functions for drawing "curves", i.e. two-dimensional
lines, on a computer. Below are some useful definitions and examples to
work with CURVES.

## Curves

A Curve is a unary function which takes a Number argument within the
unit interval `[0,1]` and returns a point (a pair of Numbers).
You can think of the Number argument as time,
and of the point returned by the Curve as the position
of your pen on a 2-dimensional plane at the time indicated by the
argument. We represent the *type* of such Curve functions like this:

Curve := Number → Point

where Point is a pair of Numbers. If `C` is a Curve, then the starting
point of the curve is always `C(0)`, and the ending point is always
`C(1)`.

## Points

To work with Points, we need a *constructor*, `make_point`, which
constructs Points from their x and y coordinates, and _selectors_,
`x_of` and `y_of`, for retrieving the x and y coordinates of a
Point.  We require only that the constructors and selectors obey the
rules

We can represent the *types* of these functions as follows:

`make_point` : (Number, Number) → Point

`x_of`, `y_of` : Point → Number

## Examples

A very simple curve is one that always returns the same point:
<a href="https://sourceacademy.nus.edu.sg/playground#chap=2&ext=CURVES&prgrm=GYVwdgxgLglg9mABABzjMUD6EQCcBuApgBRQCUiA3gFCJ2K6FR5IC2AhgNaGarpTEADADoArABpEI0WQDc1AL7UAJrnYB3XmgwBnTAmIBGQYLLE%2BGbHiJygA">
```
function point_curve(t) {
    return make_point(0.5, 0.5);
}
```
</a>

We define the Curve `unit_circle` and draw it as follows:

<a href="https://sourceacademy.nus.edu.sg/playground#chap=2&ext=CURVES&prgrm=GYVwdgxgLglg9mABOGUD6EYCcIBsCmAFFAJSIDeAUIjYlvlCFkgLYCGA1vmgA5wxgohdlAAWaAM4DCAJkQAqRCPEAFAJILEpADTVa%2Bg4drKMcCbM0n1m0iQDclAL6UAJljYB3U2DD5o%2BFzRQXFw0ADcYfA9CAEYABjiSQhR0TBwCeyA">
```
function unit_circle(t) {
    return make_point(math_sin(2 * math_PI * t),
                      math_cos(2 * math_PI * t));
}
draw_connected_full_view(100)(unit_circle);
```
</a>
Here, `draw_connected_full_view` is applied to 100, which means that 100+1 numbers
between 0 and 1 are being sampled:
0, 0.01, 0.02, ..., 0.99, 1. 
The function `draw_connected_full_view` is a Curve drawer:
A function that takes a number and returns a function that turns
a Curve into a Drawing.

Drawer := Number → (Curve → Drawing)

When a program evaluates to a Drawing, the Source system
displays it graphically, in a window, instead of textually.

The functions returned by `draw_connected_full_view` stretch or shrink
the given Curve to show the full curve and maximize its width and height,
with some padding.

<a href="https://sourceacademy.nus.edu.sg/playground#chap=2&ext=CURVES&prgrm=GYVwdgxgLglg9mABOGUD6AbGYCmaCGUAFAJ4CUiA3gFCJ2IBOOUIDSUiAvAHyIC2%2BANZ4ADnGzEoAGkQlEAakQAGRAHoAjEqVkA3NQC%2B1ACYN8AdzQQEuaDiNFN2oinRZcBYkoB0AVjK6gA">
```
function unit_line_at(y) {
    return t => make_point(t, y);
}
```
</a>
This function takes a number as argument, the y position, and
returns a Curve that is a horizontal line at the level given by y.

The Curve `haf_way_line`

<a href="https://sourceacademy.nus.edu.sg/playground#chap=2&ext=CURVES&prgrm=MYewdgzgLgBAFgQwDYDMD6B3BBPNSCWYApjALwwCuY%2BUehRaCUAFAAwB0ArAJQDcAUABMATggxpQYYsChFBzAIytW3ZolSYcdYnyA">
```
const half_way_line = unit_line_at(0.5);
```
</a>

is a horizontal line starting at `(0,0.5)` and ending at `(1,0.5)`.

The type of `unit_line_at` is

Number → Curve

which is the same as:

Number → (Number → Point)

## Unary Curve Operators

A unary Curve operator is a function that takes a curve as argument and returns
a Curve. The following function `up_a_bit` is a unary Curve operator that moves
a given curve up by 0.3.

<a href="https://sourceacademy.nus.edu.sg/playground#chap=2&ext=CURVES&prgrm=GYVwdgxgLglg9mABCADgfQIZoEYygCghACcA3AUwEpEBvAKEUcWPKhKSkQF4A%2BRAWwwBrcmhRwYYAgA80cYIRIV8USpQA0iBkx269%2BxAE85ComXIq1iANSIADADoAzJQDcdAL50ICAM6cACwwAG2A0AHcMY2DJcm5kMDw0GLBRDAJHAFY3bz9OVPDk2PjUTBw8fCDQiKii1JyAE2IMQp8wVOhyBvwARjs7SnwCuqpXIA">
```
function up_a_bit(curve) {
    return t => make_point(x_of(curve(t)), 
                           y_of(curve(t)) + 0.3);
}
```
</a>

