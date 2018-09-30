// Object.defineProperty used so the keys do not appear in a for-each loop

Object.defineProperty(Object.prototype, "Inherits", {value: function( parent )
{
	parent.apply(this, Array.prototype.slice.call(arguments, 1));
}});

Object.defineProperty(Function.prototype, "Inherits", {value: function( parent )
{
	this.prototype = Object.create(parent.prototype);
	Object.defineProperty(this.prototype, "constructor", {value: this});
}});
