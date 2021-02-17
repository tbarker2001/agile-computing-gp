import fasttext
import os

modelDir = os.path.dirname(os.path.abspath(__file__))
validationFileName = os.path.join(modelDir, 'stackoverflowdata.validate.txt')
modelFileName = os.path.join(modelDir, 'model.fasttextmodel')

# Load model from file
model = fasttext.load_model(modelFileName)

# Prints test result
def print_results(N, p, r):
    print("N\t" + str(N))
    print("P@{}\t{:.3f}".format(5, p))
    print("R@{}\t{:.3f}".format(5, r))

# Test model on validation dataset
test_result = model.test(validationFileName, k=5)
print_results(*test_result)

