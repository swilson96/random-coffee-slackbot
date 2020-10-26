const execute = require('./src/endpoints/execute');

console.log("running the draw");

const draw = async () => {
  try {
    const groups = await execute();
    console.log(groups);
    console.log("DONE");
  } catch (e) {
    console.error(e);
  }
};

draw();
