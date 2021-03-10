import fasttext
import math

def predictLabelsFromSingleModel(modelFileName,num_labels,min_probability,text):
    # Load model from file
    model = fasttext.load_model(modelFileName)

    # Get predicted labels with probabilities
    labels, probs = model.predict(text, k=num_labels, threshold=min_probability)

    return labels,probs

def predictLabelsFromBothModels(num_labels,min_probability,text,arxiv_model_filename,stackoverflow_model_filename):
    arxiv_model = fasttext.load_model(arxiv_model_filename)
    stackoverflow_model = fasttext.load_model(stackoverflow_model_filename)

    labels, probs = arxiv_model.predict(text, k=num_labels, threshold=min_probability)
    labels_so,probs_so = stackoverflow_model.predict(text, k=num_labels, threshold=min_probability)

    for i in range(len(labels_so)):
        if(labels_so[i]  in labels):
            probs[labels.index(labels_so[i])] = math.sin(probs[labels.index(labels_so[i])]*probs[i]*math.pi/2)
        else:
            labels += labels_so[i]
            probs += probs_so[i] * 0.75

    return labels,probs
    
