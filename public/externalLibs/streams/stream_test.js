// list_test.js: Testing list.js
// Author: Martin Henz

load("test.js");
load("list.js");
load("stream.js");

test_init("stream.js");

test( "stream_tail(pair(1,function() {return 2;}))", 2);

test( "is_stream([])", true);

test( "is_stream(pair(1,2))", false);

test( "is_stream(pair(1,function(){return [];}))", true);

test( "stream_to_list(stream(1,2))", pair(1,pair(2,[])));

test( "stream_to_list(list_to_stream(list(1,2,3)))", list(1,2,3));

test( "stream()", []);

test( "stream_length(stream(1,2,3))", 3);

test( "stream_length([])", 0);

function plusone(x) { return x + 1; }

test( "stream_to_list(stream_map(plusone,stream(1,2,3)))",
      list(2,3,4) );

function inc(x) { return x + 1; }

test( "stream_to_list(build_stream(4,inc))", list(1,2,3,4) );

var acc = 0;
function add_to_acc(x) { acc = acc + x; }
test( "stream_for_each(add_to_acc,stream(1,2,3));acc",
      6 );

test( "stream_to_list(stream_reverse( stream(1,2,3)))", list(3,2,1) );

test( "stream_to_vector( stream(1,2,3) )", [1,2,3] );

test( "stream_to_list(stream_append( stream(1,2,3), stream(4,5,6) ))", list(1,2,3,4,5,6) );

test( "stream_to_list(stream_member( 2, stream(1,2,3,4) ))", list(2,3,4) );

test( "stream_to_list(stream_remove( 2, stream(1,2,3,2,4) ))", list(1,3,2,4) );

test("stream_to_list(stream_remove_all( 2, stream(1,2,3,2,4) ))", list(1,3,4) );

test( "stream_to_list(stream_filter(function(x){ return ((x % 2) == 0); }, stream(1,2,3,4,5,6,7,8,9)))", list(2,4,6,8));

test( "stream_to_list(stream_filter(function(x){ return x > 0; }, stream(-1, 0, 3, -2, -4, 4, 5, 9, -2, 0)))", list(3,4,5,9));

test( "stream_to_list(stream_filter(function(x){ return true; }, stream(1,2,3)))", list(1,2,3));

test( "stream_to_list(stream_filter(function(x){ return false; }, stream(1,2,3)))", list());

test( "stream_to_list(enum_stream(1,2))",  list(1,2));

test( "stream_to_list(enum_stream(2,5))",  list(2,3,4,5));

test( "stream_to_list(enum_stream(4,4))",  list(4));

test( "stream_to_list(enum_stream(5,4))",  []);

test("stream_ref(stream(1,2,3,4),0)", 1);

test("stream_ref(stream(1,2,3,4),3)", 4);

test("stream_ref(integers_from(10),20)", 30);

test("stream_ref(integers_from(10),20)", 30);

test("eval_stream(integers_from(10),4)", list(10,11,12,13));
