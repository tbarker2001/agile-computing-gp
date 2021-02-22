var assert = require('assert');
const { processProfile, processTask, overrideTaskLabels, calculateMatchScores } = require('../nlp_interface.js');

describe('NLP pipeline', () => {
  describe('#processProfile', () => {
    it('should return a list of labels for the scraped profile', () => {
      processProfile({
	    "username": "oli1",
	    "stack_profile": "https://stackoverflow.com/users/12870/oli"
      })
      .then(labels => labels["model_output"][0]["label"])
    })
  });
      
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

  })
});

