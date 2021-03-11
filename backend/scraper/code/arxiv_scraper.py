from bs4 import BeautifulSoup
from urllib.request import urlopen, Request
import requests
import re
import nltk
import time

import scraper_methods

nltk.download('punkt', quiet=True)
nltk.download('averaged_perceptron_tagger', quiet=True)
taggedfilename = "arxiv-tagged-data-2020.txt"
untaggedfilename = "arxiv-untagged-data-2020.txt"


def main():
    scan_all_arxiv_computer_science_categories2020()


# TODO: ensure this works for all catergories on export.arxiv
def scan_all_arxiv_categories_recent():
    session = requests.session()
    url = "https://export.arxiv.org/"
    html = session.get(url).text

    soup = BeautifulSoup(html, "lxml")
    for link in soup.findAll('a', attrs={'href': re.compile("list/")}):
        scan_category(url + link.get('href'), session=session)


# scrape from all arxiv categories
def scan_all_arxiv_computer_science_categories2020():
    url = "https://export.arxiv.org/"

    session = requests.session()
    html = scraper_methods.get_html(url, session)
    soup = BeautifulSoup(html, "lxml")
    parsed = 0

    for link in soup.findAll('a', attrs={'href': re.compile("list/cs\.")}):
        l = "https://export.arxiv.org/" + (link.get('href')).replace("recent", "20")
        scan_category(l, parsed, session)


def scan_category(url, parsed, session=None):

    html = scraper_methods.get_html(url, session)
    soup = BeautifulSoup(html, "lxml")
    all_file_pages = (str(soup.find("small"))).split(' ')[3]

    if (int(all_file_pages)) > 2000:
        all_file_pages = "2000"
    url += "?skip=0&show=" + all_file_pages

    html = scraper_methods.get_html(url, session)
    soup = BeautifulSoup(html, "lxml")
    c2 = 0
    for link in soup.findAll('a', attrs={'href': re.compile("/abs/")}):
            if c2 > int(allfilespage):
                break
            time.sleep(0.3)
            print(str(c2)+', ', end = '')
            try:
                parsePaper("https://export.arxiv.org/"+link.get('href'),session)
            except urllib.error.HTTPError:
                print("removed")
            c2+=1
            parsed+=1


def parse_paper(url, session=None):
    # Fetch parts from page

    # three sets of useful information here, tags from subjects, what we can get from the title, what we can get out
    # of the abstract
    html = scraper_methods.get_html(url, session)
    soup = BeautifulSoup(html, "lxml")

    # fetch paper title
    title = str(soup.title.string)
    title = (re.sub(r'\[[^]]*\]', '', title))

    # fetch the tags(subjects) for the paper
    subjects = str(soup.find('td', {'class': 'tablecell subjects'}).get_text())
    subjects = subjects.replace("\n", "")
    subjects = subjects.replace(" ", "")
    subjects = (re.sub(r'\([^)]*\)', '', subjects)).split(';')

    # collect the abstract
    abstract = str(soup.find('blockquote', {'class': 'abstract mathjax'}).get_text())[10:]
    abstract = abstract.replace("\n", "")

    # Process data
    # TODO: consider if more processing could help
    title_tokens = scraper_methods.tokenize_title(title)

    # Save the data to files suitable for use with fasttext, one for supervised learning, one for non supervised leaning
    write_labelled_abstracts(subjects, title_tokens, abstract, taggedfilename)
    write_abstracts_and_titles(abstract, title, untaggedfilename)


# takes a list of tag strings and writes them to a file
def write_labelled_abstracts(subjects, title, abstract, filename):
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


def write_abstracts_and_titles(abstract, title, filename):
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
