function fn(number) {
  return number * 2;
}

function print(callback) {
  const result = callback("3");
  console.log(result);
}

print(fn);

