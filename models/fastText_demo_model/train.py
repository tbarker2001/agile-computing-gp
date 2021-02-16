import fasttext
import os

modelDir = os.path.dirname(os.path.abspath(__file__))
trainFileName = os.path.join(modelDir, 'stackoverflowdata.train.txt')
modelFileName = os.path.join(modelDir, 'model.fasttextmodel')

# Train supervised model from labelled StackOverflow threads
model = fasttext.train_supervised(trainFileName, epoch=25, lr=1.0, wordNgrams=2, verbose=2, minCount=1)

# Quantize model to reduce size
model.quantize(input=trainFileName, qnorm=True, retrain=True, cutoff=100000)

# Save model to file
model.save_model(modelFileName)

