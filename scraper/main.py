from bs4 import BeautifulSoup
from urllib.request import urlopen





def main():
    url = "https://stackoverflow.com/tags"
    page = urlopen(url)
    html = page.read().decode("utf-8")
    soup = BeautifulSoup(html, "html.parser")
    tags = soup.findAll("a","post-tag")
    #prints all tags on the webpage
    for tag in tags:
        print(tag.string)

if __name__ == "__main__":
    main()
