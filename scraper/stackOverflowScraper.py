from bs4 import BeautifulSoup
from urllib.request import urlopen
import multiprocessing as mp


class StackOverflowPost:

    def __init__(self, url):
        html = urlopen(url).read().decode("utf-8")
        soup = BeautifulSoup(html, "html.parser")

        self._post_tags = [tag.text for tag in soup.find(class_="post-taglist").findAll(class_="post-tag")]
        self._title = soup.find(id="question-header").find(class_="question-hyperlink").string

        post_lines = []
        for line in soup.find(class_="s-prose js-post-body").findAll("p"):
            if line.div is not None:
                line.div.extract()
            post_lines.append(line.text.replace('\n', ' ').replace('\r', ''))

        self._post = self.cleanLines(soup.find(class_="s-prose js-post-body").findAll("p"))

        self._answers = [self.cleanLines(answer.findAll("p")) for answer in soup.findAll(class_="answer")]

        # todo more comprehensive cleanup of freetext

    def getPostTags(self):
        return self._post_tags

    def getTitle(self):
        return self._title

    def getPost(self):
        return self._post

    def getAnswers(self):
        return self._answers

    def cleanLines(self, lines):
        cleaned_lines = []
        for line in lines:
            if line.div is not None:
                line.div.extract()
            cleaned_lines.append(line.text.replace('\n', ' ').replace('\r', ''))
        joined_lines = " ".join(cleaned_lines)
        return joined_lines

    def __str__(self):
        return self._title


def getStackOverflowPosts(url):
    while True:
        html = urlopen(url).read().decode("utf-8")
        soup = BeautifulSoup(html, "html.parser")

        links_html = soup.find(id="questions").find_all(class_="question-hyperlink")
        links = ["https://stackoverflow.com" + question["href"] for question in links_html]

        for link in links:
            yield StackOverflowPost(link)

        # check if another page exists then updates url if so
        next_page = soup.find(class_="s-pagination--item js-pagination-item", rel="next")
        if next_page is None:
            break
        else:
            url = "https://stackoverflow.com" + next_page["href"]


def getStackOverflowTags(url):
    while True:
        page = urlopen(url)
        html = page.read().decode("utf-8")
        soup = BeautifulSoup(html, "html.parser")

        for tag in soup.findAll(class_="post-tag"):
            yield tag.string

        # check if another page exists then updates url if so
        next_page = soup.find("a", class_="s-pagination--item js-pagination-item", rel="next")
        if next_page is None:
            break
        else:
            url = "https://stackoverflow.com" + next_page["href"]


if __name__ == "__main__":
    post_url = "https://stackoverflow.com/questions?tab=Votes"
    posts = getStackOverflowPosts(post_url)
    for _ in range(5):
        print(posts.__next__())
    # todo error catching for incorrect website links and testing
    tag_page_url = "https://stackoverflow.com/tags"
    tags = getStackOverflowTags(tag_page_url)
    bounded_tags = [tags.__next__() for _ in range(5)]
    for t in bounded_tags:
        print(t)
