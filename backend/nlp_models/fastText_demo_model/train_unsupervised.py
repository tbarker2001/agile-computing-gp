import fasttext
import os

modelDir = os.path.dirname(os.path.abspath(__file__))
trainFileName = os.path.join(modelDir, 'arxiv-untagged-data-2020.txt')
modelFileName = os.path.join(modelDir, 'arxiv.fasttextvecs')

# Train supervised model from labelled StackOverflow threads
model = fasttext.train_unsupervised(trainFileName, thread=4)

# NOTE Cannot quantize word embeddings (unsupervised model), resulting in ~800MB vecs file

# Save model to file
model.save_model(modelFileName)

