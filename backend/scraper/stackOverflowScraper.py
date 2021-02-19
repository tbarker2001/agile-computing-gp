from bs4 import BeautifulSoup
from urllib.request import urlopen
import multiprocessing as mp


class StackOverflowProfile:
    def __init__(self, url):
        self._username = url[url.rfind("/") + 1:]

        top_tag_url = url + "?tab=tags"
        self._top_tags = getStackOverflowTags(top_tag_url)

        answered_post_url = url + "?tab=answers"
        self._answered_posts = getStackOverflowPosts(answered_post_url, "u-answer")

        asked_post_url = url + "?tab=questions"
        self._asked_posts = getStackOverflowPosts(asked_post_url, "u-question")

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
        soup = BeautifulSoup(html, "html.parser")

        self._post_tags = [tag.text for tag in soup.find(class_="post-taglist").findAll(class_="post-tag")]
        self._title = soup.find(id="question-header").find(class_="question-hyperlink").string

        self._post = cleanLines(soup.find(class_="s-prose js-post-body").findAll("p"))

        self._answers = [cleanLines(answer.findAll("p")) for answer in soup.findAll(class_="answer")]

        # todo more comprehensive cleanup of freetext

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
        soup = BeautifulSoup(html, "html.parser")
        if mode == "general":
            links_html = soup.find(id="questions").find_all(class_="question-hyperlink")
        elif mode == "u-question":
            links_html = soup.find(id="user-tab-questions").find_all(class_="question-hyperlink")
        elif mode == "u-answer":
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


if __name__ == "__main__":

    print(StackOverflowProfile("https://stackoverflow.com/users/87234/gmannickg"))
    post_url = "https://stackoverflow.com/questions?tab=Votes"
    posts = getStackOverflowPosts(post_url, "general")

    # write data out to file in format required by fastText
    with open('../models/fastText_demo_model/stackoverflowdata.txt', 'w+') as fout:
        for _ in range(10):
            post = posts.__next__()
            unique_tags = set(post._post_tags)
            labels_prefix = ''
            for tag in unique_tags:
                labels_prefix += ('__label__' + tag + ' ')
            fout.write(labels_prefix + post._post + " " + " ".join(post._answers) + '\n')

    # todo error catching for incorrect website links and testing
    tag_page_url = "https://stackoverflow.com/tags"
    tags = getStackOverflowTags(tag_page_url)
    bounded_tags = [tags.__next__() for _ in range(5)]
    for t in bounded_tags:
        print(t)
