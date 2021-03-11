import re

import faiss
import fasttext
import json
import numpy as np
import os
import sys

import en_core_web_sm  # download via python -m spacy download en_core_web_sm
import nltk
import xx_ent_wiki_sm  # download via python -m spacy download xx_ent_wiki_sm

import supervised_model_prediction_methods

fasttext.FastText.eprint = lambda x: None

nlpmultilang = xx_ent_wiki_sm.load()
nlpeng = en_core_web_sm.load()
nltk.download('punkt', quiet=True)
nltk.download('averaged_perceptron_tagger', quiet=True)


def anonymise_text(text):
    tokenedtextml = nlpmultilang(text)
    tokenedtexteng = nlpeng(text)
    entstoremoveml = [ent for ent in tokenedtextml.ents if ent.label_ == 'PER']
    entstoremoveeng = [ent for ent in tokenedtexteng.ents if ent.label_ == 'PERSON' or ent.label_ == 'NORP']
    for ent in entstoremoveml:
        text = text.replace(ent.text, "")
    for ent in entstoremoveeng:
        text = text.replace(ent.text, "")

    tokens = nltk.word_tokenize(text)
    tagged = nltk.pos_tag(tokens)
    text = ' '.join([word for word, tag in tagged if tag != 'PRP' and tag != 'PRP$'])

    return text


modelDir = os.path.dirname(os.path.abspath(__file__))
arxiv_model_filename = os.path.join(modelDir, 'supervised_arxiv_filtered.bin')
stackoverflow_model_filename = os.path.join(modelDir, 'supervised_stackoverflow.bin')
embeddingsFile = os.path.join(modelDir, 'unsupervised_alldata.bin')
skillcloudVocabularyFile = os.path.join(modelDir, 'skills_unique.txt')
skillcloudIndexFile = os.path.join(modelDir, 'skillcloud.index')

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

    text = re.sub("\\r\\n|\\n", " ", text)
    text = anonymise_text(text)

    # Get predicted labels with probabilities
    supervised_labels, supervised_label_probs = supervised_model_prediction_methods.predictLabelsFromBothModels(num_labels,min_probability,text,arxiv_model_filename,stackoverflow_model_filename)


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
    
    STRICTNESS_COEFF = 1.05
    nearestSkillVecs[0] = np.exp(-STRICTNESS_COEFF * nearestSkillVecs[0])

    # Merge two sets of labels
    remaining = num_labels
    sup_i, unsup_i = 0, 0
    merged_labels_with_probs = []

    label_set = set()

    # TODO handle case where there aren't enough labels
    while remaining > 0:
        if nearestSkillVecs[0][unsup_i] > supervised_label_probs[sup_i]:
            if skillcloud[nearestSkillVecs[1][unsup_i]] in label_set:
                unsup_i += 1
                continue
            label_set.add(skillcloud[nearestSkillVecs[1][unsup_i]])
            merged_labels_with_probs.append((skillcloud[nearestSkillVecs[1][unsup_i]], nearestSkillVecs[0][unsup_i]))
            unsup_i += 1
            remaining -= 1
        else:
            if supervised_labels[sup_i][labelPrefixLength:].capitalize() in label_set:
                sup_i += 1
                continue
            label_set.add(supervised_labels[sup_i][labelPrefixLength:].capitalize())
            merged_labels_with_probs.append(
                (supervised_labels[sup_i][labelPrefixLength:].capitalize(), supervised_label_probs[sup_i]))
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
