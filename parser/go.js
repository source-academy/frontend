const goParser = require('./goparser');
const { push, peek } = require('./helper');

const goCode = `
func main() {
  var x int = 100
}
`;

let C
let S
let E

const microcode = {
  lit: 
    cmd => push(S, cmd.val),
  nam:
    cmd => 
    push(S, lookup(cmd.sym, E)),
  unop:
    cmd =>
    push(C, {tag: 'unop_i', sym: cmd.sym}, cmd.frst),
  binop:
    cmd =>
    push(C, {tag: 'binop_i', sym: cmd.sym}, cmd.scnd, cmd.frst),
  fun:
    cmd =>
    push(C, {tag:  'const',
              sym:  cmd.sym,
              expr: {tag: 'lam', prms: cmd.prms, body: cmd.body}}),
}

const global_frame = {}
const empty_env = null
const global_env = [global_frame, empty_env]
const parse = (program) => ({ tag: 'blk', body: goParser.parse(program) })

const execute = (program) => {
  C = [parse(program)]
  S = []
  E = global_env
  console.log("C", C)
}

try {
  execute(goCode);
  console.log(JSON.stringify(ast, null, 2));
} catch (error) {
  console.error("Error parsing Go code:", error.message);
}
