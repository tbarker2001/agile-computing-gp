from bs4 import BeautifulSoup
from urllib.request import urlopen, Request
import re
import nltk
import time

import scraper_methods

import spacy
from spacy import displacy
from collections import Counter
import xx_ent_wiki_sm
import en_core_web_sm
nlpmultilang = xx_ent_wiki_sm.load()
nlpeng = en_core_web_sm.load()
nltk.download('punkt')
nltk.download('averaged_perceptron_tagger')
profilesfilename = "selected-cl-profiles.txt"

def main():
    scanAllPeople()
    
#scrape from all profile pages on the cl website
def scanAllPeople():
    url = "https://www.cst.cam.ac.uk/people"
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.3'}
    req = Request(url=url, headers=headers)
    page = urlopen(req)
    html = page.read().decode("utf-8")
    soup = BeautifulSoup(html, "html.parser")
    
    #fetch the links from the all members tab only
    tabs = soup.findAll('div', attrs={'id':"qt-staff-ui-tabs1"})
    peoplelist = tabs[0].findAll('td')   
    
    for td in peoplelist:
        linktext = td.find('a', attrs={'href': re.compile("")})
        if (linktext != None):
           #if the person has a link to a webpage, scan their profile
           scanProfile(linktext.get('href'))
            

def scanProfile(url):
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.3'}
    req = Request(url=url, headers=headers)
    page = urlopen(req)
    html = ""
    try: #try to decode the page in utf-8, if it doesn't work, use utf-16
        html = page.read().strip().decode("utf-8","ignore").encode("utf-8","ignore")
        
    except:
        html = page.read().strip().decode("utf-16","ignore").encode("utf-16","ignore")
    
    soup = BeautifulSoup(html, "html.parser")
    text = soup.text
    text = scraper_methods.anononymiseText(text)
    text = text.replace("\n", " ")
    writeText(text,profilesfilename)
    

def writeText(text, filename):
    
    try:
        f = open(filename, 'a', encoding='utf-8', errors='ignore')

        f.write(text + "/n")
    except FileNotFoundError:
        print("Unable to open file " + filename)
    except UnicodeEncodeError as e:
        print(text)
        print("unknown char")
        print (type(e))
        print (e.args)
    finally:
        f.close()

if __name__ == "__main__":
    main()
