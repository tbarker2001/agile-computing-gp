import re
import time
from urllib.request import urlopen, Request

import en_core_web_sm  # download via python -m spacy download en_core_web_sm
import nltk
import xx_ent_wiki_sm  # download via python -m spacy download xx_ent_wiki_sm

nlpmultilang = xx_ent_wiki_sm.load()
nlpeng = en_core_web_sm.load()
nltk.download('punkt', quiet=True)
nltk.download('averaged_perceptron_tagger', quiet=True)

TIMEOUT_LIMIT = 32


def tokenize_title(title):
    """split title into initial tokens"""
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
    """ Extracts the text from each line then removes newline characters"""
    cleaned_lines = []
    for line in lines:
        if line.div is not None:
            line.div.extract()
        cleaned_lines.append(re.sub("\\r\\n|\\n", " ", line.text))
    joined_lines = " ".join(cleaned_lines)
    return joined_lines


def generator_pop(iterable):
    """ Pops an item from the generator"""
    try:
        first = next(iterable)
    except StopIteration:
        return None
    return first


def get_html(url, session, headers=None):
    """Gets html from a page

     Parameters
        ----------
        url: str
        The url of the web page
        session: request.Session
        The requests session to be used
        headers: dict
        The header for the request
        """

    if headers is None:
        # Headers so they know who we are
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.3'}

    iterations = 0
    while True:
        if session is None:
            req = Request(url=url, headers=headers)
            page = urlopen(req)
            try:  # try to decode the page in utf-8, if it doesn't work, use utf-16
                html = page.read().strip().decode("utf-8", "ignore").encode("utf-8", "ignore")

            except UnicodeEncodeError:
                html = page.read().strip().decode("utf-16", "ignore").encode("utf-16", "ignore")
        else:
            response = session.get(url, headers=headers)
            try:
                response.encoding = "utf-8"
                html = response.text.strip().encode("utf-8", "ignore")
            except UnicodeEncodeError:
                response.encoding = "utf-16"
                html = response.text.strip().encode("utf-16", "ignore")

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
    tokened_text_ml = nlpmultilang(text)
    tokened_text_eng = nlpeng(text)
    entstoremoveml = [ent for ent in tokened_text_ml.ents if ent.label_ == 'PER']
    entstoremoveeng = [ent for ent in tokened_text_eng.ents if ent.label_ == 'PERSON' or ent.label_ == 'NORP']
    for ent in entstoremoveml:
        text = text.replace(ent.text, "")
    for ent in entstoremoveeng:
        text = text.replace(ent.text, "")

    tokens = nltk.word_tokenize(text)
    tagged = nltk.pos_tag(tokens)
    text = ' '.join([word for word, tag in tagged if tag != 'PRP' and tag != 'PRP$'])

    return text
