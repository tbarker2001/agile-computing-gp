from bs4 import BeautifulSoup
from urllib.request import urlopen
import re

def main():
    parsePaper("https://arxiv.org/abs/2102.07764")
    '''tags_left = True
    url = "https://stackoverflow.com/tags"
    #url = "https://stackoverflow.com/tags?page=1779&tab=popular"
    filename = "tag-test.csv"

    while tags_left:
        page = urlopen(url)
        html = page.read().decode("utf-8")
        soup = BeautifulSoup(html, "html.parser")
        tags = soup.findAll("a", "post-tag")
        tag_list = [tag.string for tag in tags]
        # process tags
        writeStackTags(tag_list, filename)

        # check if another page exists then updates url if so
        nextpage = soup.find("a", "s-pagination--item js-pagination-item", rel="next")
        if nextpage is None:
            tags_left = False
        else:
            url = "https://stackoverflow.com" + nextpage["href"]
'''
#scrape from all arxiv categories
def scanAllArxivCategories():
    url = "https://arxiv.org/"
    page = urlopen(url)
    html = page.read().decode("utf-8")
    soup = BeautifulSoup(html, "html.parser")
    for link in soup.findAll('a', attrs={'href': re.compile("^http://arxiv.org/list/")}):
        scanCategory(link.get('href'))

def scanCategory(url):
    page = urlopen(url)
    html = page.read().decode("utf-8")
    soup = BeautifulSoup(html, "html.parser")


def scanPapersFromPastYear():
    url = "https://arxiv.org/search/advanced?advanced=1&terms-0-operator=AND&terms-0-term=&terms-0-field=title&classification-computer_science=y&classification-physics_archives=all&classification-include_cross_list=include&date-filter_by=past_12&date-year=&date-from_date=&date-to_date=&date-date_type=submitted_date&abstracts=show&size=50&order=-announced_date_first"
    page = urlopen(url)
    html = page.read().decode("utf-8")
    soup = BeautifulSoup(html, "html.parser")
    pages_left = true;
    while(pages_left):
        for link in soup.findAll('a', attrs={'href': re.compile("^http://arxiv.org/abs/")}):
            parsePaper(link.get('href'))

        nextpage = soup.find("a", "s-pagination--item js-pagination-item", rel="next")
        if nextpage is None:
            pages_left = False
        else:
            url = "https://stackoverflow.com" + nextpage["href"]

def parsePaper(url):
    #three sets of useful information here, tags from subjects, what we can get from the title, what we can get out of the abstract
    page = urlopen(url)
    html = page.read().decode("utf-8")
    soup = BeautifulSoup(html, "html.parser")

    #fetch paper title
    title = str(soup.title.string)
    title = (re.sub(r'\[[^]]*\]', '', title))

    #fetch the tags(subjects) for the paper
    subjects = str(soup.find('td',{'class':'tablecell subjects'}).get_text())
    subjects = (re.sub(r'\([^)]*\)', '', subjects)).split(';')

    #collect the abstract
    abstract = str(soup.find('blockquote',{'class':'abstract mathjax'}).get_text())[10:]
    print(abstract)
    
    
# takes a list of tag strings and writes them to a file
def writeStackTags(tags, filename):
    try:
        f = open(filename, "a")
        for tag in tags:
            f.write(tag + ",")
        f.write("\n")
    except FileNotFoundError:
        print("Unable to open file " + filename)
    finally:
        f.close()

if __name__ == "__main__":
    main()
