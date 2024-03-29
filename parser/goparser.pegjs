start
  = _ program:program _ { return program; }

program
  = functionDeclaration

expression
  = literal / unop / undefined

statement
  = variableDeclaration

literal
  = val:literal_values {
      return {
        tag: "lit",
        val: val
      }
    }

literal_values
  = number / true / false

unop
  = sym:unary_operator _ frst:literal_values {
      if (sym === '!') {
        if (frst === true || frst === false) {
          return {
            tag: "unop",
            sym: sym,
            frst: frst
          }
        } else {
          throw new Error('Illegal expression')
        }
      } else if (sym === '-') {
        if (frst !== true && frst !== false) {
          return {
            tag: "unop",
            sym: sym,
            frst: frst
          }
        } else {
          throw new Error('Illegal expression')
        }
      }
    }

unary_operator
  = [!-]

number
  = digits:[0-9]+ decimal:("." [0-9]+)? {
      return parseFloat(digits.join("") + (decimal ? decimal.join('') : ''));
    }

true
  = "true" {
      return true;
    }

false
  = "false" {
      return false;
    }

undefined
  = "undefined" {
      return {
        tag: "nam",
        sym: "undefined"
      }
    }

functionDeclaration
  = "func" _ sym:identifier _ "(" _ prms:identifier? _ ")" _ "{" _ body:statement? _ "}" {
      return {
        tag: "fun",
        sym: sym,
        prms: prms ? prms.split(",") : [],
        body: body
      };
    }

variableDeclaration
  = "var" _ name:identifier _ typeName:identifier _ "="? _ val:literal? {
      return {
        tag: "var",
        name: name,
        dataType: typeName,
        val: val
      };
    }

return
  = "return" _ expr:expression _ {
    return {
      tag: "ret",
      expr: expr
    };
  }

identifier
  = chars:identifier_char { return [chars[0], chars[1].join("")].join(""); }

identifier_char
  = [a-zA-Z_][a-zA-Z_0-9]*

// Whitespace management
_ "whitespace"
  = [ \t\n\r]*
