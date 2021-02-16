import fasttext

# Load model form file
model = fasttext.load_model('model.fasttextmodel')

# Read free text input from terminal
text = str(input())

# Print top 5 predicted labels with probabilities
print(model.predict(text, k=5))

