import faiss
import fasttext
import numpy as np
import os

modelDir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../combined_model/')
embeddingsFile = os.path.join(modelDir, 'unsupervised_alldata.bin')
skillcloudVocabularyFile = os.path.join(modelDir, 'skills_unique.txt')
indexOutputFile = os.path.join(modelDir, 'skillcloud.index')

if __name__ == "__main__":

    # Load fastText word embeddings
    model = fasttext.load_model(embeddingsFile)

    # Load skillcloud
    skillcloud = []
    with open(skillcloudVocabularyFile, 'r') as f:
        skillcloud = f.read().splitlines()

    # Load skill vectors from fastText model
    skillvecs = np.array([model.get_word_vector(skill.lower()) for skill in skillcloud])
    print(skillvecs.shape)

    # Specify index type
    index = faiss.index_factory(model.get_dimension(), "L2norm,HNSW64", faiss.METRIC_INNER_PRODUCT)

    # Train the index
    if not index.is_trained:
        index.train(skillvecs)

    # Add the skill word vectors to index, with id into skillcloud array by default
    index.add(skillvecs)

    assert index.ntotal == len(skillcloud)

    print("Testing...")

    k = 2 # Want to see 2 nearest neighbours
    branchvec = model.get_word_vector("branch")
    pythonVec = model.get_word_vector("python")
    D, I = index.search(np.array([branchvec, pythonVec]), k)

    print(I)
    print("Top 2 nearest neighbours for \"branch\"")
    print([skillcloud[i] for i in I[0]])
    print("Top 2 nearest neighbours for \"python\"")
    print([skillcloud[i] for i in I[1]])
    print("Distance metrics:")
    print(D)

    # Write out index to file
    faiss.write_index(index, indexOutputFile)

