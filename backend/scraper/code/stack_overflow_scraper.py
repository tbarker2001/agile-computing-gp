import re
import time
from enum import Enum

import requests
from bs4 import BeautifulSoup

from scraper_methods import cleanLines, generator_pop, anonymise_text, get_html


class PostMode(Enum):
    GENERAL = 1
    ANSWER = 2
    QUESTION = 3


class StackOverflowProfile:
    """A class used to represent a users stack overflow profile
        Attributes
        ----------
        _username : str
            the username of the profile
        _top_tags : str generator
            a generator which can be used to obtain the tags most commonly associated with the profile
        _answered_posts : StackOverflowPost generator
            a generator which can be used to obtain the most popular answered posts associated with the profile
        _asked_posts : StackOverflowPost generator
            a generator which can be used to obtain the most popular asked posts associated with the profile
    """

    def __init__(self, url):
        """
        takes the stack overflow profile url and scrapes data

        Parameters
        ----------
        url: str
        The url of the stack overflow profile
        """

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
        """Builds the freetext associated with the stack overflow profile

        Parameters
        ----------
        parameters : dictionary
        Options for what free text is wanted
        """
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

        free_text = anonymise_text(free_text).replace("_", " ")
        return free_text


class StackOverflowPost:
    """A class used to represent a stack overflow post
        Attributes
        ----------

        _post_tags : set
            a set the string tags associated with the post
        _title : str
            the posts title
        _post : str
            the posts freetext
        _answers : str list
            the posts answers
    """

    def __init__(self, url, session=None):
        """
        takes the stack overflow post url and scrapes data

        Parameters
        ----------
        url: str
        The url of the stack overflow post
        session: request.Session
        The requests session to be used
        """
        html = get_html(url, session)
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

    def get_free_text(self, training=False):
        """Builds the freetext associated with the stack overflow post

        Parameters
        ----------
        training : bool
        Used to indicate if we are obtaining training data(if so we include labels)
        """
        if training:
            labels_prefix = "__label__ " + " __label__ ".join(self._post_tags)
            free_text = "{labels} {title} {post} {answers}".format(labels=labels_prefix, title=self._title,
                                                                   post=self._post,
                                                                   answers=" ".join(self._answers))
            free_text = anonymise_text(free_text)
        else:
            free_text = "{title} {post} {answers}".format(title=self._title,
                                                          post=self._post,
                                                          answers=" ".join(self._answers))
        return free_text

    def __str__(self):
        return self._title


def get_stack_overflow_posts(url, mode):
    """A generator for stack overflow posts

    Parameters
        ----------
        url : string
        The url of the base page which posts can be scraped from
        mode: PostMode
        Indicates what type of post we are scraping
    """

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
            return None

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
    """A generator for stack overflow tags

    Parameters
        ----------
        url : string
        The url of the base page which tags can be drawn from
    """
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
    """ Used for data collection"""
    filepath = 'stackoverflowdata2.txt'
    start_time = time.time()
    write_posts_to_file(10000, filepath)
    end_time = time.time()
    print(end_time - start_time)


def write_posts_to_file(n, filepath):
    """
    Writes the most popular n posts to a file
    Parameters
        ----------
        n: int
        The number of posts to write
        filepath: str
        The filepath of the file you want to write the posts to.
    """
    post_url = "https://stackoverflow.com/questions?tab=Votes"
    posts = get_stack_overflow_posts(post_url, PostMode.GENERAL)

    with open(filepath, 'w+', encoding="utf-8") as fout:
        for _ in range(n):
            post = generator_pop(posts)
            if post is not None:
                line = post.get_free_text(training=True) + "\n"
                fout.write(line)


if __name__ == "__main__":
    main()
