import re
import time
from urllib.request import urlopen

import en_core_web_sm  # download via python -m spacy download en_core_web_sm
import nltk
import xx_ent_wiki_sm  # download via python -m spacy download xx_ent_wiki_sm

nlpmultilang = xx_ent_wiki_sm.load()
nlpeng = en_core_web_sm.load()
nltk.download('punkt')
nltk.download('averaged_perceptron_tagger')

TIMEOUT_LIMIT = 32


def tokenize_title(title):
    # split title into initial tokens
    tokens = nltk.word_tokenize(title)
    tagged = nltk.pos_tag(tokens)

    # remove tokens that are tagged with CC (coordinating conjunction), DT (Determiner), EX (existential there),
    # IN (preposition of subordinating conjunction) PDT, PRP, PRP$, RP, TO, UH, WP, WP$, WRB, WDT
    tagged = list(filter(
        lambda x: x[1] != 'CC' and x[1] != 'DT' and x[1] != 'EX' and x[1] != 'IN' and x[1] != 'PDT' and x[
            1] != 'PRP' and x[1] != 'PRP$' and x[1] != 'RP' and x[1] != 'TO' and x[1] != 'UH' and x[1] != 'WP' and x[
                      1] != 'WP$' and x[1] != 'WRB' and x[1] != 'WDT', tagged))

    # TODO: potentially develop this to gather by clauses
    return tagged


def cleanLines(lines):
    cleaned_lines = []
    for line in lines:
        if line.div is not None:
            line.div.extract()
        cleaned_lines.append(re.sub("\\r\\n|\\n", " ", line.text))
    joined_lines = " ".join(cleaned_lines)
    return joined_lines


def generator_pop(iterable):
    try:
        first = next(iterable)
    except StopIteration:
        return None
    return first


def get_html(url, session):
    iterations = 0
    while True:
        if session is None:
            html = urlopen(url).read().decode("utf-8")
        else:
            html = session.get(url).text

        if html is None:
            if iterations > TIMEOUT_LIMIT:
                raise TimeoutError
            else:
                iterations += 1
                time.sleep(0.5)
        else:
            return html


# Find and remove entities recognised as names, and also parts of speech tagged as pronouns
def anonymise_text(text):
    tokenedtextml = nlpmultilang(text)
    tokenedtexteng = nlpeng(text)
    entstoremoveml = [ent for ent in tokenedtextml.ents if ent.label_ == 'PER']
    entstoremoveeng = [ent for ent in tokenedtexteng.ents if ent.label_ == 'PERSON' or ent.label_ == 'NORP']
    for ent in entstoremoveml:
        text = text.replace(ent.text, "")
    for ent in entstoremoveeng:
        text = text.replace(ent.text, "")

    tokens = nltk.word_tokenize(text)
    tagged = nltk.pos_tag(tokens)
    text = ' '.join([word for word, tag in tagged if tag != 'PRP' and tag != 'PRP$'])

    return text
