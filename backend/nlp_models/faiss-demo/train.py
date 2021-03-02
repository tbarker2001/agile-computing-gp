import faiss
import fasttext
import numpy as np
import os

modelDir = os.path.dirname(os.path.abspath(__file__))
embeddingsFile = os.path.join(modelDir, '../fastText_demo_model/arxiv.fasttextvecs')
skillcloudVocabularyFile = os.path.join(modelDir, '../fastText_demo_model/arxiv-skillcloud.txt')
indexOutputFile = os.path.join(modelDir, 'skillcloud.index')

if __name__ == "__main__":

    # Load fastText word embeddings
    model = fasttext.load_model(embeddingsFile)

    # Load skillcloud
    skillcloud = []
    with open(skillcloudVocabularyFile, 'r') as f:
        skillcloud = f.read().splitlines()

    # Load skill vectors from fastText model
    skillvecs = np.array([model.get_word_vector(skill) for skill in skillcloud])
    print(skillvecs.shape)

    # Specify index type TODO experiment with different types
    index = faiss.index_factory(model.get_dimension(), "L2norm,HNSW32")

    # Train the index
    if not index.is_trained:
        index.train(skillvecs)

    # Add the skill word vectors to index, with id into skillcloud array by default
    index.add(skillvecs)

    assert index.ntotal == len(skillcloud)

    print("Testing...")

    k = 2 # Want to see 2 nearest neighbours
    branchvec = model.get_word_vector("branch")
    D, I = index.search(np.array([branchvec]), k)

    print("Top 2 nearest neighbours")
    print([skillcloud[i] for i in I[0]])
    print("Distance metrics:")
    print(D)

    # Write out index to file
    faiss.write_index(index, indexOutputFile)

