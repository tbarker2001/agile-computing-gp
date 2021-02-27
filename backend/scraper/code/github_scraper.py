from urllib.request import urlopen

from bs4 import BeautifulSoup

from backend.scraper.code.parsing_methods import cleanLines, tokenize_title


class GithubIssue:

    def __init__(self, url, session=None):
        if session is None:
            html = urlopen(url).read().decode("utf-8")
        else:
            html = session.get(url).text
        soup = BeautifulSoup(html, "html.parser")

        self._title = soup.find(class_="js-issue-title").text

        self._post = cleanLines(soup.find(class_="edit-comment-hide").findAll("p"))

    def __str__(self):
        return self._title

    def get_post(self):
        return self._post

    def get_free_text(self):
        title_tokens = tokenize_title(self._title)
        labels_prefix = "__label__ " + " __label__ ".join(title_tokens)

        freetext = "{labels} {post}\n".format(labels=labels_prefix, post=self._post)

        return freetext


class GithubCommit:
    "Takes commit, tokenize title into tags, save description,  then store code as freetext"

    def __init__(self, url, session=None):
        if session is None:
            html = urlopen(url).read().decode("utf-8")
        else:
            html = session.get(url).text
        soup = BeautifulSoup(html, "lxml")

        self._title = soup.find(class_="commit-title").text

        lines = soup.findAll(class_="blob-code-inner blob-code-marker", attrs={"data-code-marker": "+"})
        self._code_lines = [line.text for line in lines if line.text != ""]
        self._code = "\n".join(self._code_lines)

        print(self._code)

    def get_title(self):
        return self._title

    def get_code(self):
        return self._code

    def get_free_text(self):
        title_tokens = tokenize_title(self._title)
        labels_prefix = "__label__ " + " __label__ ".join(title_tokens)
        free_text = "{labels_prefix} {code}\n".format(labels_prefix=labels_prefix, code=" ".join(self._code_lines))

        return free_text


def main():
    # GithubIssue("https://github.com/google/blockly/issues/4617")
    GithubCommit("https://github.com/tbarker2001/agile-computing-gp/commit/fdce435a01e341f3bc93ea7f3b0e7275ea50adbd")


if __name__ == "__main__":
    main()
