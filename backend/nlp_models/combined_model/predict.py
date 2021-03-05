import faiss
import fasttext
import json
import numpy as np
import os
import sys

modelDir = os.path.dirname(os.path.abspath(__file__))
supervisedModelFile = os.path.join(modelDir, '../fastText_demo_model/model.fasttextmodel')
embeddingsFile = os.path.join(modelDir, '../fastText_demo_model/arxiv.fasttextvecs')
skillcloudVocabularyFile = os.path.join(modelDir, '../fastText_demo_model/arxiv-skillcloud.txt')
skillcloudIndexFile = os.path.join(modelDir, '../faiss-demo/skillcloud.index')

labelPrefixLength = len("__label__")

"""
    Outputs the most likely labels for a given task description.
    TODO: calculate data quality score
    Usage: <predictTask>  '{"text": <string>, "num_labels": <int>[=25], "num_top_labels": <int>[=8], "min_probability": <real>[=0.0]}'
    Returns: '{
        "model_output": [{"label": <string>, "probability": <real>}, ...],
        "data_quality_score": <real>,
        "top_labels": [<string>, ...]
    }'
"""
if __name__ == "__main__":
    # Parse JSON input
    input_json = json.loads(sys.argv[1])
    text = input_json['text']
    num_labels = input_json['num_labels'] if 'num_labels' in input_json else 25
    num_top_labels = input_json['num_top_labels'] if 'num_top_labels' in input_json else 8
    min_probability = input_json['min_probability'] if 'min_probability' in input_json else 0.0

    # Load supervised model from file
    model = fasttext.load_model(supervisedModelFile)

    # Get predicted labels with probabilities
    supervised_labels, supervised_label_probs = model.predict(text, k=num_labels, threshold=min_probability)

    # Load embeddings
    embeddings = fasttext.load_model(embeddingsFile)

    # Load skillcloud
    skillcloud = []
    with open(skillcloudVocabularyFile, 'r') as f:
        skillcloud = f.read().splitlines()

    # Load index for skillcloud
    skillcloudIndex = faiss.read_index(skillcloudIndexFile)

    # Extract nearest neighbours among skillword vectors
    textVec = embeddings.get_sentence_vector(text)
    nearestSkillVecs = skillcloudIndex.search(np.array([textVec]), num_labels)
    nearestSkillVecs = [nearestSkillVecs[0][0], nearestSkillVecs[1][0]]

    # Transform distances
    # TODO this transform determines how the two models are merged, experiment!
    STRICTNESS_COEFF = 2.5
    nearestSkillVecs[0] = np.exp(-STRICTNESS_COEFF * nearestSkillVecs[0])

    # Merge two sets of labels
    remaining = num_labels
    sup_i, unsup_i = 0, 0
    merged_labels_with_probs = []

    # TODO handle case where there aren't enough labels
    while remaining > 0:
        if nearestSkillVecs[0][unsup_i] > supervised_label_probs[sup_i]:
            merged_labels_with_probs.append((skillcloud[nearestSkillVecs[1][unsup_i]], nearestSkillVecs[0][unsup_i]))
            unsup_i += 1
            remaining -= 1
        else:
            merged_labels_with_probs.append((supervised_labels[sup_i][labelPrefixLength:], supervised_label_probs[sup_i]))
            sup_i += 1
            remaining -= 1

    # Extract top labels
    top_labels = [label for label, _ in merged_labels_with_probs[:min(num_top_labels, len(merged_labels_with_probs))]]

    # Construct output JSON object
    model_output = [
        dict(
            label=label,
            probability=np.float64(prob)
        )
        for label, prob in merged_labels_with_probs
    ]
    output = {
        "model_output": model_output,
        "data_quality_score": 1.0,
        "top_labels": model_output[:min(num_top_labels, len(model_output))]
    }
    sys.stdout.write(json.dumps(output))
    sys.stdout.flush()


