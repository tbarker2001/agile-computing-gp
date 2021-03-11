import fasttext
import math
import numpy as np

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
            p = list(probs)
            p[labels.index(labels_so[i])] = math.sin(probs[labels.index(labels_so[i])]*probs[i]*math.pi/2)
            probs = tuple(p)
        elif len(probs) > 0:
            l,p = insert_labelprobpair(list(labels),list(probs),labels_so[i],probs_so[i])
            labels = tuple(l)
            probs = tuple(p)

    # Weight the model - and definitely "wait" the model ;)
    probs = tuple((np.array(probs) * 25) % 0.9874)
    return labels,probs

def insert_labelprobpair(labels,probs,label,prob):
    i = 0
    l,p = [],[]
    while(i < len(probs) and probs[i] > prob):
        
        l.append(labels[i])
        p.append(probs[i])
        i+=1
    l.append(label)
    p.append(prob)
    l+=labels[i:]
    p+=probs[i:]
    return l,p
    

def merge_labelprobabilitypairs(labels,probs,labels_so,probs_so):
    l = []
    p = []
    num_l = len(labels)
    num_so = len(labels_so)
    i,j = 0,0
    while i<num_l and j<num_so:
            if(probs[i]<probs_so[j]):
                l.append(labels_so[j])
                p.append(probs_so[j])
                j+=1
            else:
                l.append(labels[i])
                p.append(probs[i])
                i+=1
            
    l += labels_so[j:] + labels[i:]
    p += probs_so[j:] + probs[i:]
    return l,p
