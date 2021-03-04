import re
import time

from bs4 import BeautifulSoup
from urllib.request import urlopen
import requests

from enum import Enum

from parsing_methods import cleanLines, generator_pop


class PostMode(Enum):
    GENERAL = 1
    ANSWER = 2
    QUESTION = 3


class StackOverflowProfile:
    def __init__(self, url):
        self._username = url[url.rfind("/") + 1:]

        top_tag_url = url + "?tab=tags"
        self._top_tags = get_stack_overflow_tags(top_tag_url)

        answered_post_url = url + "?tab=answers"
        self._answered_posts = get_stack_overflow_posts(answered_post_url, PostMode.ANSWER)

        asked_post_url = url + "?tab=questions"
        self._asked_posts = get_stack_overflow_posts(asked_post_url, PostMode.QUESTION)

    def __str__(self):
        return self._username

    def get_top_tags(self):
        return self._top_tags

    def get_answered_posts(self):
        return self._answered_posts

    def get_asked_posts(self):
        return self._asked_posts

    def get_free_text(self, parameters=None):
        if parameters is None:
            parameters = {"answered_posts": 25, "asked_posts": 25, "top_tags": 0}
        free_text = ""

        for key, n in parameters.items():
            generator = None
            if key == "answered_posts":
                generator = self._answered_posts
            elif key == "asked_posts":
                generator = self._asked_posts
            elif key == "top_tags":
                generator = self._top_tags

            if generator is not None:
                for _ in range(n):
                    item = generator_pop(generator)
                    if type(item) == StackOverflowPost:
                        free_text += item.get_free_text() + '\n'
                    elif type(item) == str:
                        free_text += item + '\n'
        return free_text


class StackOverflowPost:

    def __init__(self, url, session=None):
        if session is None:
            html = urlopen(url).read()
        else:
            html = session.get(url).text
        soup = BeautifulSoup(html, "lxml")

        self._post_tags = {tag.text for tag in soup.find(class_="post-taglist").findAll(class_="post-tag")}

        title_text = soup.find(id="question-header").find(class_="question-hyperlink").string
        self._title = re.sub("  +|\\n|\\r", "", title_text)

        self._post = cleanLines(soup.find(class_="s-prose js-post-body").findAll("p"))

        self._answers = [cleanLines(answer.findAll("p")) for answer in soup.findAll(class_="answer")]

    def get_post_tags(self):
        return self._post_tags

    def get_title(self):
        return self._title

    def get_post(self):
        return self._post

    def get_answers(self):
        return self._answers

    def get_free_text(self):
        #todo consider tokenising title and added that as tags
        labels_prefix = "__label__ " + " __label__ ".join(self._post_tags)
        free_text = "{labels} {post} {answers}".format(labels=labels_prefix, post=self._post,
                                                       answers=" ".join(self._answers))
        return free_text

    def __str__(self):
        return self._title


def get_stack_overflow_posts(url, mode):
    requests_session = requests.session()
    while True:
        r = requests_session.get(url)
        soup = BeautifulSoup(r.text, "lxml")

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
            yield StackOverflowPost(link, requests_session)

        # check if another page exists then updates url if so
        next_page = soup.find(class_="s-pagination--item js-pagination-item", rel="next")
        if next_page is None:
            break
        else:
            url = "https://stackoverflow.com" + next_page["href"]


def get_stack_overflow_tags(url):
    requests_session = requests.session()
    while True:
        html = requests_session.get(url).text
        soup = BeautifulSoup(html, "lxml")

        for tag in soup.findAll(class_="post-tag"):
            yield tag.string

        # check if another page exists then updates url if so
        next_page = soup.find("a", class_="s-pagination--item js-pagination-item", rel="next")
        if next_page is None:
            break
        else:
            url = "https://stackoverflow.com" + next_page["href"]


def main():
    filepath = '../../../models/fastText_demo_model/stackoverflowdata.txt'
    start_time = time.time()
    write_posts_to_file(100, filepath)
    end_time = time.time()
    print(end_time - start_time)


def write_posts_to_file(n, filepath):
    """
    Writes the most popular n posts to a file
    """
    post_url = "https://stackoverflow.com/questions?tab=Votes"
    posts = get_stack_overflow_posts(post_url, PostMode.GENERAL)

    with open(filepath, 'w+', encoding="utf-8") as fout:
        for _ in range(n):
            post = generator_pop(posts)
            if post is not None:
                line = post.get_free_text() + "\n"
                fout.write(line)


if __name__ == "__main__":
    main()
