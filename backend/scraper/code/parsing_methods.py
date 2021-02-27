import re

import nltk


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
