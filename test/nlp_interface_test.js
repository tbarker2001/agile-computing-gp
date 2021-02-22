var assert = require('assert');
const { processProfile, processTask } = require('../nlp_interface.js');

describe('NLP pipeline', () => {
  describe('#processProfile', () =>
    it('should return a list of labels for the scraped profile', () =>
      processProfile({
	    "username": "oli1",
	    "stack_profile": "https://stackoverflow.com/users/12870/oli"
      })
      .then(labels => labels["model_output"][0]["label"])
    )
  );
      
  describe('#processTask', () =>
    it('should return a list of labels', () =>
      processTask({
	"text": "When we push commits on to a new branch the git history is always broken",
//      "num_labels": 4,
//      "min_probability": 0.01
      })
      .then(labels => labels["model_output"][0]["label"])
    )
  )
});

