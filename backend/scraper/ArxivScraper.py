from bs4 import BeautifulSoup
from urllib.request import urlopen, Request
import requests
import re
import nltk
import time

nltk.download('punkt')
nltk.download('averaged_perceptron_tagger')
taggedfilename = "arxiv-tagged-data-2020.txt"
untaggedfilename = "arxiv-untagged-data-2020.txt"


def main():
    scanAllArxivComputerScienceCategories2020()


# TODO: ensure this works for all catergories on export.arxiv
def scanAllArxivCategoriesRecent():
    session = requests.session()
    url = "https://export.arxiv.org/"
    html = session.get(url).text

    soup = BeautifulSoup(html, "lxml")
    for link in soup.findAll('a', attrs={'href': re.compile("list/")}):
        scanCategory(url + link.get('href'), session=session)


# scrape from all arxiv categories
def scanAllArxivComputerScienceCategories2020():
    url = "https://export.arxiv.org/"
    # Headers so they know who we are
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 '
                      'Safari/537.3'}
    session = requests.session()
    html = session.get(url, headers=headers).text
    soup = BeautifulSoup(html, "lxml")
    parsed = 0
    # print(html)
    # print(soup.findAll('a', attrs={'href': re.compile("list/cs\.")}))

    for link in soup.findAll('a', attrs={'href': re.compile("list/cs\.")}):
        l = "https://export.arxiv.org/" + (link.get('href')).replace("recent", "20")
        print("\n " + l + " Parsed " + str(parsed))
        scanCategory(l, parsed, session)


def scanCategory(url, parsed, session=None):
    print("hi")

    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 '
                      'Safari/537.3'}
    if session is None:
        req = Request(url=url, headers=headers)
        page = urlopen(req)
        html = page.read().decode("utf-8")
    else:
        html = session.get(url, headers=headers).text

    soup = BeautifulSoup(html, "lxml")
    allfilespage = (str(soup.find("small"))).split(' ')[3]

    print(allfilespage)
    if ((int(allfilespage)) > 2000):
        allfilespage = "2000"
    url += "?skip=0&show=" + allfilespage

    if session is None:
        req = Request(url=url, headers=headers)
        page = urlopen(req)
        html = page.read().decode("utf-8")
    else:
        html = session.get(url, headers=headers).text
    soup = BeautifulSoup(html, "lxml")
    print(url)
    c2 = 0
    for link in soup.findAll('a', attrs={'href': re.compile("/abs/")}):
        if parsed % 200 == 0:
            time.sleep(60)
        print(str(c2) + ', ', end='')
        parsePaper("https://export.arxiv.org/" + link.get('href'), session)
        c2 += 1
        parsed += 1


def parsePaper(url, session=None):
    # Fetch parts from page

    # three sets of useful information here, tags from subjects, what we can get from the title, what we can get out
    # of the abstract
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 '
                      'Safari/537.3'}
    if session is None:
        req = Request(url=url, headers=headers)
        page = urlopen(req)
        html = page.read().decode("utf-8")
    else:
        html = session.get(url, headers=headers).text
    soup = BeautifulSoup(html, "lxml")

    # fetch paper title
    title = str(soup.title.string)
    title = (re.sub(r'\[[^]]*\]', '', title))

    # fetch the tags(subjects) for the paper
    subjects = str(soup.find('td', {'class': 'tablecell subjects'}).get_text())
    subjects = subjects.replace("\n", "")
    subjects = (re.sub(r'\([^)]*\)', '', subjects)).split(';')

    # collect the abstract
    abstract = str(soup.find('blockquote', {'class': 'abstract mathjax'}).get_text())[10:]
    abstract = abstract.replace("\n", "")

    # Process data
    # TODO: consider if more processing could help
    titletokens = tokenizeTitle(title)

    # Save the data to files suitable for use with fasttext, one for supervised learning, one for non supervised leaning
    writeLabelledAbstracts(subjects, titletokens, abstract, taggedfilename)
    writeAbstractsandTitles(abstract, title, untaggedfilename)


def tokenizeTitle(title):
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


# takes a list of tag strings and writes them to a file
def writeLabelledAbstracts(subjects, title, abstract, filename):
    try:
        f = open(filename, "a")
        for tag in subjects:
            f.write("__label__" + tag + " ")
        for tag in title:
            f.write("__label__" + tag[0] + " ")
        f.write(abstract)
        f.write("\n")
    except FileNotFoundError:
        print("Unable to open file " + filename)
    finally:
        f.close()


def writeAbstractsandTitles(abstract, title, filename):
    try:
        f = open(filename, "a")

        f.write(title + "#")
        f.write(abstract + "\n")
    except FileNotFoundError:
        print("Unable to open file " + filename)
    finally:
        f.close()


if __name__ == "__main__":
    main()
