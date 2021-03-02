import faiss
import fasttext
import numpy as np
import os

modelDir = os.path.dirname(os.path.abspath(__file__))
embeddingsFile = os.path.join(modelDir, '../fastText_demo_model/arxiv.fasttextvecs')
skillcloudVocabularyFile = os.path.join(modelDir, '../fastText_demo_model/arxiv-skillcloud.txt')
indexFile = os.path.join(modelDir, 'skillcloud.index')

if __name__ == "__main__":

    # Load fastText word embeddings
    model = fasttext.load_model(embeddingsFile)

    # Load skillcloud
    skillcloud = []
    with open(skillcloudVocabularyFile, 'r') as f:
        skillcloud = f.read().splitlines()

    # Load index for skillcloud
    index = faiss.read_index(indexFile)

    # Test a couple of words
    words = ["type", "design", "branch"]
    wordvecs = [model.get_word_vector(word) for word in words]
    wordvecs = np.array(wordvecs)
    D, I = index.search(wordvecs, 10)

    print(D.shape, I.shape)
    for i in range(len(words)):
        print("Nearest neighbours for word \"" + words[i] + "\":")
        for ni in range(I.shape[1]):
            print(skillcloud[I[i][ni]] + " (" + str(D[i][ni]) + ")")
        print()

