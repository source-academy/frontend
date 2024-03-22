{
  function flatten(arr) {
    return arr.reduce((flat, next) => flat.concat(next), []);
  }
}

start
  = binary

binary
  = left:primary _ rest:binary_right* {
      let result = rest.reduce((acc, curr) => {
        if (curr[0] === '+') return acc + curr[1];
        else if (curr[0] === '-') return acc - curr[1];
        else if (curr[0] === '*') return acc * curr[1];
        else if (curr[0] === '/') return acc / curr[1];
      }, left);
      return result;
    }

binary_right
  = _ operator:binary_operator _ operand:primary {
      return [operator, operand];
    }

primary
  = "(" _ binary:binary _ ")" { return binary; }
  / number
  / string

number
  = digits:[0-9]+ decimal:("." [0-9]+)? {
      return parseFloat(digits.join("") + (decimal ? decimal.join('') : ''));
    }

string
  = '"' chars:char* '"' { return chars.join(""); }

char
  = [^\n\r"]

binary_operator
  = "+" / "-" / "*" / "/"

_ "whitespace"
  = [ \t\n\r]*
