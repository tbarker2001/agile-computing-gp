from bs4 import BeautifulSoup
from urllib.request import urlopen


def main():
    tags_left = True
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
