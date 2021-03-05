import re
from urllib.request import urlopen

import requests
from bs4 import BeautifulSoup

from scraper_methods import cleanLines, tokenize_title, generator_pop, get_html, anonymise_text


class GithubIssue:

    def __init__(self, url, session=None):
        html = get_html(url, session)
        soup = BeautifulSoup(html, "html.parser")

        title_text = soup.find(class_="js-issue-title").text
        self._title = re.sub("  +|\\n|\\r|…", "", title_text)

        self._post = cleanLines(soup.find(class_="edit-comment-hide").findAll("p"))

    def __str__(self):
        return self._title

    def get_post(self):
        return self._post

    def get_free_text(self):
        title_tokens = [tag[0] for tag in tokenize_title(self._title)]

        labels_prefix = "__label__ " + " __label__ ".join(title_tokens)

        freetext = "{labels} {post}\n".format(labels=labels_prefix, post=self._post)

        freetext = anonymise_text(freetext)
        return freetext


class GithubCommit:
    "Takes commit, tokenize title into tags, save description,  then store code as freetext"

    def __init__(self, url, session=None):
        html = get_html(url, session)
        soup = BeautifulSoup(html, "lxml")

        main_title = soup.find("p", class_="commit-title")

        desc_part = soup.find(class_="commit-desc")
        if desc_part is None:
            self._title = re.sub("  +|\\n|\\r|…", "", main_title.text)
        else:
            self._title = re.sub("  +|\\n|\\r|…", "", (main_title.text + desc_part.text))

        lines = soup.findAll(class_="blob-code-inner blob-code-marker", attrs={"data-code-marker": "+"})
        self._code_lines = [line.text for line in lines if line.text != ""]
        self._code = "\n".join(self._code_lines)

    def __str__(self):
        return self._title

    def get_title(self):
        return self._title

    def get_code(self):
        return self._code

    def get_free_text(self):
        title_tokens = [tag[0] for tag in tokenize_title(self._title)]
        labels_prefix = "__label__ " + " __label__ ".join(title_tokens)
        free_text = "{labels_prefix} {code}\n".format(labels_prefix=labels_prefix, code=" ".join(self._code_lines))
        freetext = anonymise_text(free_text)

        return free_text


class GithubProfile:

    def __init__(self, url, session=None):

        html = get_html(url, session)
        soup = BeautifulSoup(html, "lxml")

        self._username = soup.find(class_="vcard-username").text

        self._commits = get_github_commits(self._username)

        self._issues = get_github_issues(self._username)

    def __str__(self):
        return self._username

    def get_commits(self):
        return self._commits

    def get_issues(self):
        return self._issues

    def get_free_text(self, parameters=None):
        if parameters is None:
            parameters = {"commits": 25, "issues": 25}
        free_text = ""

        for key, n in parameters.items():
            generator = None
            if key == "commits":
                generator = self._commits
            elif key == "issues":
                generator = self._issues

            if generator is not None:
                for _ in range(n):
                    item = generator_pop(generator)
                    if item is not None:
                        free_text += item.get_free_text()

        free_text = anonymise_text(free_text)
        return free_text


def get_github_commits(username):
    url = "https://github.com/search?q=author%3A{username}&type=Commits".format(username=username)
    requests_session = requests.session()
    while True:
        html = requests_session.get(url).text
        soup = BeautifulSoup(html, "lxml")

        commits = soup.findAll(class_="message js-navigation-open")
        links = {"https://github.com" + commit["href"] for commit in commits}
        for link in links:
            yield GithubCommit(link, requests_session)

        # check if another page exists then updates url if so
        next_page = soup.find("a", class_="next_page", rel="next")
        if next_page is None:
            break
        else:
            url = "https://github.com" + next_page["href"]


def get_github_issues(username):
    url = "https://github.com/search?q=is%3Aissue+user%3A{username}".format(username=username)
    requests_session = requests.session()
    while True:
        html = requests_session.get(url).text
        soup = BeautifulSoup(html, "lxml")

        issues = [issue.find("a", title=re.compile(".")) for issue in soup.findAll(class_="issue-list-item")]
        links = {"https://github.com" + issue["href"] for issue in issues}
        for link in links:
            yield GithubIssue(link, requests_session)

        # check if another page exists then updates url if so
        next_page = soup.find("a", class_="next_page", rel="next")
        if next_page is None:
            break
        else:
            url = "https://github.com" + next_page["href"]


def main():
    # GithubIssue("https://github.com/google/blockly/issues/4617")
    # GithubCommit("https://github.com/tbarker2001/agile-computing-gp/commit/fdce435a01e341f3bc93ea7f3b0e7275ea50adbd")
    profile = GithubProfile("https://github.com/tbarker2001")  #
    print(profile.get_free_text())
    commits = profile._issues
    i = 0
    item = generator_pop(commits)
    while (item != None):
        print(item)
        item = generator_pop(commits)
        i += 1
    print(i)


if __name__ == "__main__":
    main()
