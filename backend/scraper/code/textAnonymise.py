import nltk
import spacy
from spacy import displacy
import xx_ent_wiki_sm
import en_core_web_sm
nlpmultilang = xx_ent_wiki_sm.load()
nlpeng = en_core_web_sm.load()
nltk.download('punkt')
nltk.download('averaged_perceptron_tagger')


#Find and remove entities recognised as names, and also parts of speech tagged as pronouns
def anononymiseText(text):
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
    text = ' '.join([word for word,tag in tagged if tag != 'PRP' and tag != 'PRP$'])

    return text

    

if __name__ == "__main__":
    main()
