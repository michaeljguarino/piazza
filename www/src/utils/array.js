function* reverse(array, mapper = (i) => i) {
  for (let i = array.length - 1; i >= 0; i--) {
    yield mapper(array[i])
  }
}

function* rollup(array, mapper = (i) => i) {
  let prev = {}
  for (let item of array) {
    yield mapper(item, prev)
    prev = item
  }
}

export {reverse, rollup}