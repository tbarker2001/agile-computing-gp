import requests
from bs4 import BeautifulSoup
from urllib.request import urlopen, Request
import re
import nltk

import scraper_methods

import xx_ent_wiki_sm
import en_core_web_sm

nlpmultilang = xx_ent_wiki_sm.load()
nlpeng = en_core_web_sm.load()
nltk.download('punkt')
nltk.download('averaged_perceptron_tagger')
profiles_filename = "selected-cl-profiles.txt"


def main():
    scanAllPeople()


# scrape from all profile pages on the cl website
def scanAllPeople():
    url = "https://www.cst.cam.ac.uk/people"

    session = requests.session()
    html = scraper_methods.get_html(url, session)
    soup = BeautifulSoup(html, "lxml")

    # fetch the links from the all members tab only
    tabs = soup.findAll('div', attrs={'id': "qt-staff-ui-tabs1"})
    people_list = tabs[0].findAll('td')

    for td in people_list:
        link_text = td.find('a', attrs={'href': re.compile("")})
        if link_text is not None:
            # if the person has a link to a webpage, scan their profile
            scanProfile(link_text.get('href'), session=session)


def scanProfile(url, session=None):
    html = scraper_methods.get_html(url, session)
    soup = BeautifulSoup(html, "lxml")

    text = soup.text
    text = scraper_methods.anonymise_text(text)
    text = re.sub("\\r\\n|\\n", " ", text)
    writeText(text, profiles_filename)


def writeText(text, filename):
    try:
        f = open(filename, 'a', encoding='utf-8', errors='ignore')

        f.write(text + "\n")
    except FileNotFoundError:
        print("Unable to open file " + filename)
    except UnicodeEncodeError as e:
        print(text)
        print("Found unknown character:\n type e:{te} \n args e: {ea}".format(te=type(e), ea=e.args))
    finally:
        f.close()


if __name__ == "__main__":
    main()
