import numpy as np
import os
from sklearn.feature_extraction.text import CountVectorizer
from stopwords import stopwords

fastTextModelDir = os.path.join(
        os.path.dirname(os.path.abspath(__file__)),
        '../fastText_demo_model/')
rawTextFile = os.path.join(fastTextModelDir, 'arxiv-untagged-data-2020.txt')
skillcloudFile = os.path.join(fastTextModelDir, 'arxiv-skillcloud.txt')

if __name__ == "__main__":

    # Construct vectorizer object accepting only lowercase letters
    cv = CountVectorizer(input='file', stop_words=stopwords, token_pattern=r"(?u)\b[a-z][a-z]+\b")

    f = open(rawTextFile, "r")
    # Extract vocabulary & count tokens
    X = cv.fit_transform([f]).toarray()
    f.close()

    feature_names = cv.get_feature_names()
    print(feature_names[:40])

    print("X has shape:", X.shape)

    skillcloud_size = 500
    top_word_ids = np.argsort(-X[0])[:skillcloud_size]
    print(top_word_ids[:10])
    top_words = [feature_names[top_word_id] for top_word_id in top_word_ids]

    print(top_words[:50])

    # Save skillcloud to file
    with open(skillcloudFile, "w") as f:
        for skill in top_words:
            f.write(skill)
            f.write('\n')

