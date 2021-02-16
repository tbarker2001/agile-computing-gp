from urllib.request import urlopen

from bs4 import BeautifulSoup
import stackOverflowScraper as sovscraper


class GithubIssue:

    def __init__(self, url):
        html = urlopen(url).read().decode("utf-8")
        soup = BeautifulSoup(html, "html.parser")

        self._title = soup.find(class_="js-issue-title").text

        self._post = sovscraper.cleanLines(soup.find(class_="edit-comment-hide").findAll("p"))

    def __str__(self):
        return self._title

    def getPost(self):
        return self._post


def main():
    GithubIssue("https://github.com/google/blockly/issues/4617")


if __name__ == "__main__":
    main()
