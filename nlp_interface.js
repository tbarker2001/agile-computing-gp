const { spawn } = require('child_process');
const modelsDir = __dirname + "/models/fastText_demo_model/";
const scraperDir = __dirname + "/scraper/TODO";
const virtualEnvDir = __dirname + "/agilecompenv"; // Replace with your venv or /usr
const python = virtualEnvDir + "/bin/python";

let runPython = (dirName, scriptName, args) => new Promise((success, reject) => {
  const script = dirName + scriptName;
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


// Scraper & NLP backend API


/// @function processProfile
/// Scrapes user profile then invokes the NLP model to assign labels
/// @param {Object} profileInfo The contents of the add user form
/// @returns {Promise<Object>} The model output on the profile
let processProfile = (profileInfo) =>
  runPython(scraperDir, SCRAPERNAMETODO, profileInfo)
  .then((scraperOutput) => runPython(modelsDir, "predictProfile.py", {
    // TEMPORARY
    "text": scraperOutput.toString()
  }))

/// @function processTask
/// Invokes the NLP model on the task description to assign labels
/// @param {Object} taskInfo Format TBD currently string of task description
/// @returns {Promise<Object>} The model output on the task
/// Caller must catch any errors.
let processTask = (taskInfo) =>
  runPython(modelsDir, "predictTask.py", taskInfo)

/// @function overrideTaskLabels
/// Adjusts the model output for the task with the creator's modifications
/// (can delete labels or manually enter new labels)
/// @param {Object} overriddenTaskInfo Contents of the override model output form
/// @returns {Promise<Object>} Modified model output
/// Caller must catch any errors.
let overrideTaskLabels = (overriddenTaskInfo) =>
  runPython(modelsDir, "overrideTaskLabels.py", overriddenTaskInfo)

// Expecting "[
// 	{
//		"task_id": <string>,
//		"model_output": [{}...]
//	},...
// ], [
//	{
//		"account_id": <string>,
//		"model_output": [{}...]
//	},...
// ]"
/// @function calculateMatchScores
/// Invokes the task to profile matching algorithm to calculate numeric
/// relevance score between each pair of task and profile
/// @param {List<Object>} tasks List of task model outputs
/// @param {List<Object>} profiles List of profile model outputs
/// @returns {Promise<Object>} Format TBD scores between each task-profile pair
/// Caller must catch any errors.
let calculateMatchScores = (tasks, profiles) =>
  runPython(modelsDir, "match.py", {
    "account_set": profiles,
    "task_set": tasks
  })

module.exports = {processProfile, processTask, overrideTaskLabels, calculateMatchScores};
