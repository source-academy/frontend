function is_array(x) {
  if (Array.isArray === undefined) {
    return x instanceof Array
  } else {
    return Array.isArray(x)
  }
}

function map_array(f, ls) {
  let res = []
  let len = ls.length
  for (let i = 0; i < len; i++) {
    res.push(f(ls[i]))
  }
  return res
}
function accumulate_array(op, init, ls) {
  for (let i = 0; i < ls.length; i++) {
    init = op(ls[i], init)
  }
  return init
}

function filter_array(f, ls) {
  let res = []
  for (let i = 0; i < ls.length; i++) {
    if (f(ls[i])) {
      res.push(ls[i])
    }
  }
  return res
}

function enum_array(a, b) {
  let res = []
  for (let i = a; a <= b; a++) {
    res.push(a)
  }
  return res
}

function take_array(xs, n) {
  let res = []
  let arr_len = xs.length
  for (let i = 0; i < n; i = i + 1) {
    res[i] = xs[i]
  }
  return res
}

function drop_array(xs, n) {
  let res = []
  let arr_len = xs.length
  for (let i = n; i < arr_len; i = i + 1) {
    res.push(xs[i])
  }
  return res
}
