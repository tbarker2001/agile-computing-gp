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


def getStackOverflowPosts(url):
    while True:
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


def getStackOverflowTags(url):
    while True:
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


if __name__ == "__main__":

    posts = getStackOverflowPosts("https://stackoverflow.com/questions?tab=Votes")

    # note we shouldnt really put the posts straight into a list but instead generate them only as needed
    bounded_posts = [posts.__next__() for _ in range(5)]
    for post in bounded_posts:
        print(post)

    # todo error catching for incorrect website links and testing
    tag_page_url = "https://stackoverflow.com/tags"
    tags = getStackOverflowTags(tag_page_url)
    bounded_tags = [tags.__next__() for _ in range(5)]
    for t in bounded_tags:
        print(t)
