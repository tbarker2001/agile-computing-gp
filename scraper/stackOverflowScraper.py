from bs4 import BeautifulSoup
from urllib.request import urlopen
import multiprocessing as mp


class StackOverflowPost:

    def __init__(self, url):
        html = urlopen(url).read().decode("utf-8")
        soup = BeautifulSoup(html, "html.parser")

        self._post_tags = [tag.text for tag in soup.findAll("a", "post-tag")]
        self._title = soup.find(id="question-header").find("a", "question-hyperlink").string

        self._post = " ".join([line.text for line in soup.find("div", "s-prose js-post-body").findAll("p")])

        self._answers = [" ".join([line.text for line in answer.findAll("p")]) for answer in
                         soup.findAll("div", "answer")]

        # todo add any additional and convert into a format wanted by fasttext

    def __str__(self):
        return self._title


def getStackOverflowPosts(url, max_num_pages):
    page_num = 0

    while page_num < max_num_pages:
        html = urlopen(url).read().decode("utf-8")
        soup = BeautifulSoup(html, "html.parser")

        links = ["https://stackoverflow.com" + question["href"] for question in
                 soup.find(id="questions").find_all(class_="question-hyperlink")]

        for link in links:
            yield StackOverflowPost(link)

        # check if another page exists then updates url if so
        next_page = soup.find("a", "s-pagination--item js-pagination-item", rel="next")
        if next_page is None:
            break
        else:
            url = "https://stackoverflow.com" + next_page["href"]
            page_num += 1
        print("next_page")


def getStackOverflowTags(url, max_num_pages):
    page_num = 0

    while page_num < max_num_pages:
        page = urlopen(url)
        html = page.read().decode("utf-8")
        soup = BeautifulSoup(html, "html.parser")

        for tag in soup.findAll("a", "post-tag"):
            yield tag.string

        # check if another page exists then updates url if so
        next_page = soup.find("a", "s-pagination--item js-pagination-item", rel="next")
        if next_page is None:
            break
        else:
            url = "https://stackoverflow.com" + next_page["href"]
            page_num += 1


if __name__ == "__main__":
    for post in getStackOverflowPosts("https://stackoverflow.com/questions?tab=Votes",2):
        print(post)

    # todo error catching for incorrect website links and testing
    tag_page_url = "https://stackoverflow.com/tags"
    for tag in getStackOverflowTags(tag_page_url,2):
        print(tag)
