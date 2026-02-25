
const arr = ["Japan", "Tokyo", "Shinjuku"];
const objAddress = { a: "Japan", b: "Tokyo", c: "Shinjuku" };

const fnArr = ([country,state,city]) => {
  console.log("---配列---");
  console.log(`country: ${country}`);
  console.log(`state: ${state}`);
  console.log(`city: ${city}`);
};

const fnObj = ({a, b, c }) => {
  console.log("---オブジェクト---");
  console.log(`country: ${a}`);
  console.log(`state: ${b}`);
  console.log(`city: ${c}`);
};

fnArr(arr);
fnObj(objAddress);
