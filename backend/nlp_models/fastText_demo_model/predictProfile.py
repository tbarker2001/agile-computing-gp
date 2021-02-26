import fasttext
import json
import os
import sys

modelDir = os.path.dirname(os.path.abspath(__file__))
modelFileName = os.path.join(modelDir, 'model.fasttextmodel')

labelPrefixLength = len("__label__")

"""
    Outputs the most likely labels for a given scraped profile.
    TODO: adjust input JSON format to scraper output
    TODO: calculate data quality score
    Usage: <predict>  '{"text": <string>, "num_labels": <int>[=5], "min_probability": <real>[=0.0]}'
    Returns: '{
        "model_output": [{"label": <string>, "probability": <real>}, ...],
        "data_quality_score": <real>
    }'
"""
if __name__ == "__main__":
    # Parse JSON input
    input_json = json.loads(sys.argv[1])
    text = input_json['text']
    num_labels = input_json['num_labels'] if 'num_labels' in input_json else 5
    min_probability = input_json['min_probability'] if 'min_probability' in input_json else 0.0

    # Load model from file
    model = fasttext.load_model(modelFileName)

    # Get predicted labels with probabilities
    labels, probs = model.predict(text, k=num_labels, threshold=min_probability)

    # Construct output JSON object
    output = {
        "model_output": [
            dict(
                label=label[labelPrefixLength:],
                probability=prob
            )
            for label, prob in zip(labels, probs)
        ],
        "data_quality_score": 1.0
    }
    sys.stdout.write(json.dumps(output))
    sys.stdout.flush()

