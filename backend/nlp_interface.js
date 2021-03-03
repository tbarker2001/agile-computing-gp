const { spawn } = require('child_process');
const modelsDir = __dirname + "/nlp_models/combined_model/";
const scraperDir = __dirname + "/scraper/code/";
const virtualEnvDir = __dirname + "/../agilecompenv"; // Replace with your venv or /usr
const python = virtualEnvDir + "/Scripts/python";

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
///  { 'username': <username>, 'links':{ 'stack_profile': <url>, 'github_profile': <url>}, }
/// @returns {Promise<Object>} The model output on the profile
///  { "model_output": <model output>, "data_quality_score": <real> }
/// Caller must catch any errors.
let processProfile = (profileInfo) =>
  runPython(scraperDir, 'profile.py', profileInfo)
  .then((scraperOutput) => runPython(modelsDir, "predict.py", scraperOutput))

/// @function processTask
/// Invokes the NLP model on the task description to assign labels
/// @param {Object} taskInfo Format TBD currently {'text': <task description string>}
/// @returns {Promise<Object>} The <model output> on the task
///  { "model_output": <model output>, "data_quality_score": <real> }
/// Caller must catch any errors.
let processTask = (taskInfo) =>
  runPython(modelsDir, "predict.py", taskInfo)

/// @function overrideTaskLabels
/// Adjusts the model output for the task with the creator's modifications
/// (can delete labels or manually enter new labels)
/// @param {Object} overriddenTaskInfo Contents of the override model output form
///  Format TBD
/// @returns {Promise<Object>} Modified model output
///  { "model_output": <model output>, "data_quality_score": <real> }
/// Caller must catch any errors.
let overrideTaskLabels = (overriddenTaskInfo) =>
  runPython(modelsDir, "overrideTaskLabels.py", overriddenTaskInfo)

/// @function calculateMatchScores
/// Invokes the task to profile matching algorithm to calculate numeric
/// relevance score between each pair of task and profile
/// @param {Object} tasks Set of task model outputs, format is
///  { <task_id>: <model_output>, ... }
/// @param {Object} profiles Set of profile model outputs
///  { <profile_id>: <model_output>, ... }
/// @returns {Promise<Object>} Scores between each task-profile pair, refer to match.py
///  { "account_set": {<account_id>: {<task_id>: {"score": <real>}}},
///    "task_set": {<task_id>: {<account_id>: {"score": <real>}}} }
/// Caller must catch any errors.
let calculateMatchScores = (tasks, profiles) =>
  runPython(modelsDir, "match.py", {
    "account_set": profiles,
    "task_set": tasks
  })

module.exports = {processProfile, processTask, overrideTaskLabels, calculateMatchScores};
