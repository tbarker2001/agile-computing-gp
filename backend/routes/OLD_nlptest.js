var express = require('express');
var router = express.Router();

const { spawn } = require('child_process');
const modelsDir = __dirname + "/../models/fastText_demo_model/";
const virtualEnvDir = __dirname + "/../agilecompenv"; // Replace with your venv or /usr
const python = virtualEnvDir + "/bin/python";

let runPython = (scriptName, args) => new Promise((success, reject) => {
  const script = modelsDir + scriptName;
  const pyArgs = [script, JSON.stringify(args)]
  const pyprog = spawn(python, pyArgs);
  let result = "";
  let resultError = "";

  pyprog.stdout.on('data', (data) => {
    result += data.toString();
  });

  pyprog.stderr.on('data', (data) => {
    resultError += data.toString();
  });

  pyprog.stdout.on("end", () => {
    if (resultError == "") {
      success(JSON.parse(result));
    } else {
      console.error(`Python error, you can reproduce the error with: \n${python} ${script} ${pyArgs.join(" ")}`);
      const error = new Error(resultError);
      console.error(error);
      reject(resultError);
    }
  })
})

router.get('/predict', (req, res, next) =>
  runPython('predict.py', {
    "text": "When we push commits on to a new branch the git history is always broken",
    "num_labels": 4,
    "min_probability": 0.05
  })
  .then((data) => {
    console.log("Sending:", JSON.stringify(data));
    res.send(JSON.stringify(data))
  })
  .catch(console.error)
)


router.get('/match', (req, res, next) =>
  Promise.all([
    runPython('predict.py', {
      "text": "When we push commits on to a new branch the git history is always broken",
      "num_labels": 4,
      "min_probability": 0.01
    }),
    runPython('predict.py', {
      "text": "I haven't been able to figure out why my interpreter does this, JavaScript is so weird, let me branch off",
      "num_labels": 4,
      "min_probability": 0.01
    })
  ])
  .then((results) => runPython('match.py', {
    "account_set": {
      "account1": results[0]
    },
    "task_set": {
      "task1": results[1]
    }
  }))
  .then((data) => {
    console.log("Sending:", JSON.stringify(data));
    res.send(JSON.stringify(data))
  })
  .catch(console.error)
)

module.exports = router;
