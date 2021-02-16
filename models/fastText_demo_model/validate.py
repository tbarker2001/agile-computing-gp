import fasttext

# Load model from file
model = fasttext.load_model('model.fasttextmodel')

# Prints test result
def print_results(N, p, r):
    print("N\t" + str(N))
    print("P@{}\t{:.3f}".format(5, p))
    print("R@{}\t{:.3f}".format(5, r))

# Test model on validation dataset
test_result = model.test('stackoverflowdata.validate.txt', k=5)
print_results(*test_result)

