var assert = require('assert');
const { processProfile, processTask, overrideTaskLabels, calculateMatchScores } = require('../nlp_interface.js');

// TODO not use arrow lambdas =>

describe('NLP pipeline', () => {
  describe('#processProfile', () => {
    it('should return a list of labels for the scraped profile', () => {
      processProfile({
	    "username": "oli1",
	    "stack_profile": "https://stackoverflow.com/users/12870/oli"
      })
      .then(labels => labels["model_output"][0]["label"])
    })
  })
      
  describe('#processTask', () => {
    it('should return a list of labels', () =>
      processTask({
	"text": "When we push commits on to a new branch the git history is always broken",
//      "num_labels": 4,
//      "min_probability": 0.01
      })
      .then(labels => labels["model_output"][0]["label"])
    )

  })


  describe('#overrideTaskLabels', () => {
    it('should not throw', () =>
      // TODO
      overrideTaskLabels({})
    )
  })

  describe('#calculateMatchScores', () => {
    it('should calculate scores with a single pair', () => {
      const tasks = {
	  "task1": [
	      {
		  "label": "apple",
		  "probability": 0.7
	      }
	  ]
      };
      const profiles = {
	  "acc1": [
	      {
		  "label": "apple",
		  "probability": 0.8
	      }
	  ]
      };
      calculateMatchScores(tasks, profiles)
      .then(scores => {
	assert.equal(typeof scores["account_set"]["acc1"]["task1"]["score"], 'double');
	assert.equal(scores["account_set"]["acc1"]["task1"], scores["task_set"]["task1"]["acc1"])
      })
    })

    it('should consume model output from processTask & processProfile', () =>
      Promise.all([
	processProfile({
	      "username": "oli1",
	      "stack_profile": "https://stackoverflow.com/users/12870/oli"
	}),
	processTask({
	  "text": "When we push commits on to a new branch the git history is always broken"
	})
      ])
      .then(results =>
	calculateMatchScores({
	  "task1": results[1]["model_output"]
	}, {
	  "acc1": results[0]["model_output"]
	})
	.then(scores => {
	  const number_types = new Set(["number", "double"]);
	  assert.ok(number_types.has(typeof scores["account_set"]["acc1"]["task1"]["score"]));
	  assert.deepEqual(scores["account_set"]["acc1"]["task1"], scores["task_set"]["task1"]["acc1"])
	})
      )
    )
  })

});

