import os
from sklearn.feature_extraction.text import CountVectorizer
from stopwords import stopwords

fastTextModelDir = os.path.join(
        os.path.dirname(os.path.abspath(__file__)),
        '../fastText_demo_model/')
rawTextFile = os.path.join(fastTextModelDir, 'arxiv-untagged-data-2020.txt')
preprocessedTextFile = os.path.join(fastTextModelDir, 'arxiv-2020-preprocessed.txt')

if __name__ == "__main__":

    # Construct vectorizer object accepting only lowercase letters
    cv = CountVectorizer(input='file', stop_words=stopwords, token_pattern=r"(?u)\b[a-z][a-z]+\b")

    # Function to strip accents and lowercase letters
    preprocess = cv.build_preprocessor()
    # Function to split into tokens using the above regex and excluding our stopwords
    tokenize = cv.build_tokenizer()

    inp = open(rawTextFile, "r")
    outp = open(preprocessedTextFile, "w")

    while True:
        line = inp.readline()
        if not line: break
        preprocessedLine = preprocess(line)
        tokenizedLine = tokenize(preprocessedLine)
        outp.write(" ".join(tokenizedLine))
        outp.write("\n")

    inp.close()
    outp.close()

