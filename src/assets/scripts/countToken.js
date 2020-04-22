export default function countToken(program) {
    const Lexer = require('lex');
    var operators = [
        '+', '-', '*', '/', '%', '!=', '==', '<', '>', '<=', '>=', '=',
        '+=', '-=', '*=', '%=', '<<', '>>', '>>>', '<<=', '>>=',
        '>>>=', '&', '&=', '|', '|=', '&&', '||', '^', '^=', '(', ')',
        '[', ']', '{', '}', '!', '--', '++', '~', ',', ';', '.', ':', '?'
    ].sort((x, y) => y.length - x.length);
 
    var row = 0;
    var col = 0;
    var tokenCount = 0;
    // eslint-disable-next-line 
    function logToken(errType, tc, val) {
        //console.log(errType, tokenCount, val)
    }
 
    var lexer = (new Lexer(function() { /* console.log('Error at ' + col + ':' + row + ':'); console.log(arguments); */ }))
    .addRule(/(\r\n|\n|\r)/, function() { this.reject = true; row++; col = 1; }, [])
    .addRule(/./, function() { this.reject = true; col++; }, [])
    // .addRule(/\s+/, function() {}) // None
    // .addRule(/<!--.*/, function() {}) // None
    // .addRule(new RegExp('//.*'), function() {}) // Line Comment
    // .addRule(new RegExp('/\\*.*?\\*/', 'm'), function() {}) // Multi-line Comment
    .addRule(/[\w$_][\w\d$_.]*[\w\d$_.]/, function(val) { tokenCount += (val.split('.').length * 2 - 1); val.split('.').map(x => logToken('D', tokenCount, x)) }) // Dotted Name
    .addRule(/[\w$_][\w\d$_]*/, function(val) { tokenCount++; logToken('N', tokenCount, val)}) // Name
    .addRule(/(?:0|[1-9]\d*)(\.\d+)/, function(val) { tokenCount++; logToken('0', tokenCount, val)}) // Number
    .addRule(new RegExp(operators.map(x => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')), function(val) { tokenCount++; logToken('O', tokenCount, val)}) // Operator
    .addRule(/( \'(?:[^\'\\]*(?:\\.[^\'\\]*)*)\' | "(?:[^"\\]*(?:\\.[^"\\]*)*)" )/, function(val) { tokenCount++; logToken('S', tokenCount, val)}) // String
    
    if(program == null) {
        return 0;
    } else {
        lexer.setInput(program);
        lexer.lex();
     
        return tokenCount;
    }

}


