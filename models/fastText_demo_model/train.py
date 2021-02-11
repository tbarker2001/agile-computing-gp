import fasttext

# Train supervised model from labelled StackOverflow threads
model = fasttext.train_supervised('stackoverflowdata.train.txt', epoch=25, lr=1.0, wordNgrams=2, verbose=2, minCount=1)

# Quantize model to reduce size
model.quantize(input='stackoverflowdata.train.txt', qnorm=True, retrain=True, cutoff=100000)

# Save model to file
model.save_model('model.fasttextmodel')

