const arry = [10, 20, 30, 40];
const newArry = [];

for (let i = 0; i < arry.length; i++) {
  newArry.push(arry[i]);
}

console.log(newArry);

const newArry2 = arry.map((x) => x * 200);
const newArry3 = newArry2.filter((y) => y > 4000);
console.log(newArry2);
console.log(newArry3);