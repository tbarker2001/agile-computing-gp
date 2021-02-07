import fasttext

# Train supervised model from labelled StackOverflow threads
model = fasttext.train_supervised('stackoverflowdata.txt')

# Test the model on a random text
prediction = model.predict("Who can I ask for advice on git workflow and how to use yield in Python?", k=5)

print("\nPrediction for \"Who can I ask for advice on git workflow and how to use yield in Python?\": " + str(prediction[0]) + " with probabilities: " + str(prediction[1]))

