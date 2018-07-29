function is_null(xs) {
	return xs === null;
}

function is_undefined(xs) {
	return typeof xs === "undefined";
}

function is_number(xs) {
	return typeof xs === "number";
}

function is_string(xs) {
	return typeof xs === "string";
}

function is_boolean(xs) {
	return typeof xs === "boolean";
}

function is_object(xs) {
	return typeof xs === "object" || is_function(xs);
}

function is_function(xs) {
	return typeof xs === "function";
}

function is_NaN(x) {
	return is_number(x) && isNaN(x);
}

function has_own_property(obj,p) {
	return obj.hasOwnProperty(p);
}

function is_array(a){
	return a instanceof Array;
}

/**
 * @deprecated Use timed instead.
 * @returns The current time, in milliseconds, from the Unix Epoch.
 */
function runtime() {
	var d = new Date();
	return d.getTime();
}

/**
 * Throws an error from the interpreter, stopping execution.
 *
 * @param {string} message The error message.
 * @param {number=} line The line number where the error occurred. This line number
 *                       will be one less than on file, because the indices used by
 *                       jison start from 0.
 * @returns {null} Should not return. Exception should be thrown otherwise program
 *                 will be in an invalid state.
 */
function error(message, line) {
	throw new SyntaxError(message, null,
		line === undefined ? undefined : line + 1);
}

function newline() {
	display("\n");
}

function random(k){
	return Math.floor(Math.random()*k);
}

function timed(f) {
	var self = this;
	var timerType = window.performance ? performance : Date;
	return function() {
		var start = timerType.now();
		var result = f.apply(self, arguments);
		var diff = (timerType.now() - start);
		console.log('Duration: ' + Math.round(diff) + 'ms');
		return result;
	};
}
function read(x) {
	return prompt(x);
}

function write(x) {
	return alert(x);
}

function apply_in_underlying_javascript(prim,argument_list) {
   var argument_array = list_to_vector(argument_list);

   //Call prim with the same this argument as what we are running under.
   //this is populated with an object reference when we are an object. We
   //are not in this context, so this will usually be the window. Thus
   //passing this as the argument shouls behave. (Notably, passing the
   //function itself as a value of this is bad: if the function that is being
   //called assumes this to be window, we'll clobber the function value instead.
   //Also, alert won't work if we pass prim as the first argument.)
   return prim.apply(this, argument_array);
}
