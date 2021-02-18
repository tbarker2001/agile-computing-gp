import time

from bs4 import BeautifulSoup
from urllib.request import urlopen
import multiprocessing as mp
from enum import Enum


class PostMode(Enum):
    GENERAL = 1
    ANSWER = 2
    QUESTION = 3


class StackOverflowProfile:
    def __init__(self, url):
        self._username = url[url.rfind("/") + 1:]

        top_tag_url = url + "?tab=tags"
        self._top_tags = getStackOverflowTags(top_tag_url)

        answered_post_url = url + "?tab=answers"
        self._answered_posts = getStackOverflowPosts(answered_post_url, PostMode.ANSWER)

        asked_post_url = url + "?tab=questions"
        self._asked_posts = getStackOverflowPosts(asked_post_url, PostMode.QUESTION)

    def __str__(self):
        return self._username

    def getTopTags(self):
        return self._top_tags

    def getAnsweredPosts(self):
        return self._answered_posts

    def getAskedPosts(self):
        return self._asked_posts


def cleanLines(lines):
    cleaned_lines = []
    for line in lines:
        if line.div is not None:
            line.div.extract()
        cleaned_lines.append(line.text.replace('\n', ' ').replace('\r', ''))
    joined_lines = " ".join(cleaned_lines)
    return joined_lines


class StackOverflowPost:

    def __init__(self, url):
        html = urlopen(url).read().decode("utf-8")
        soup = BeautifulSoup(html, "lxml")

        self._post_tags = {tag.text for tag in soup.find(class_="post-taglist").findAll(class_="post-tag")}
        self._title = soup.find(id="question-header").find(class_="question-hyperlink").string

        self._post = cleanLines(soup.find(class_="s-prose js-post-body").findAll("p"))

        self._answers = [cleanLines(answer.findAll("p")) for answer in soup.findAll(class_="answer")]

    def getPostTags(self):
        return self._post_tags

    def getTitle(self):
        return self._title

    def getPost(self):
        return self._post

    def getAnswers(self):
        return self._answers

    def __str__(self):
        return self._title


def getStackOverflowPosts(url, mode):
    while True:
        html = urlopen(url).read().decode("utf-8")
        soup = BeautifulSoup(html, "lxml")
        if mode == PostMode.GENERAL:
            links_html = soup.find(id="questions").find_all(class_="question-hyperlink")
        elif mode == PostMode.QUESTION:
            links_html = soup.find(id="user-tab-questions").find_all(class_="question-hyperlink")
        elif mode == PostMode.ANSWER:
            links_html = soup.find(id="user-tab-answers").find_all(class_="answer-hyperlink")
        else:
            return

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


def main():
    filepath = '../../models/fastText_demo_model/stackoverflowdata.txt'
    start_time = time.time()
    writePostsToFile(100, filepath)
    end_time = time.time()
    print(end_time-start_time)


def writePostsToFile(n, filepath):
    """
    Writes the most popular n posts to a file
    """
    post_url = "https://stackoverflow.com/questions?tab=Votes"
    posts = getStackOverflowPosts(post_url, PostMode.GENERAL)

    with open(filepath, 'w+',encoding= "utf-8") as fout:
        for _ in range(n):
            post = posts.__next__()
            unique_tags = post.getPostTags()
            labels_prefix = "__label__ " + " __label__ ".join(unique_tags)
            line = "{labels} {post} {answers}\n".format(labels=labels_prefix, post=post.getPost(),
                                                        answers=" ".join(post.getAnswers()))
            fout.write(line)


if __name__ == "__main__":
    main()
