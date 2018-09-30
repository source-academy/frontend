//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//
//  Code for adventure game
// 
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++

LAYOUT16A = (function() {
  var c = 0;
  var p = 1;
  var w = 2;
  var n	= 4;
  var d	= 8;
  var g	= 16;
  var s	= 32;
  var b	= 64;
  return [
    [ // L1
        [c,    w,      w,      w],
        [n,    w|n,    w|n,    w|n],
        [n,    w|n,    w|n,    w|n],
        [n,    w|n,    w|n,    w|n]
    ],

    [ // L2
        [c,    w,       w,    w|d],
        [n,    n,       n,    n],
        [n,    p|g|n,   n,    n],
        [n,    w|n,     w|n,  w|n]
    ],

    [ // L3
        [c,    w,    w,    w],
        [n,    w,    w,    w|n],
        [n,    w,    w,    w|n|d],
        [n,    w,    w,    w|n]
    ],

    [ // L4
        [c,    w,      w,      w],
        [n,    w|n,    w|n,    w|d],
        [n,    w|n,    w|n,    w],
        [n,    w|n,    w|n,    w|n]
    ]
];})();
