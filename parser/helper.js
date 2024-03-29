const push = (array, ...items) => {
    array.splice(array.length, 0, ...items)
    return array
}

const peek = array => array.slice(-1)[0]

module.exports = { push, peek }