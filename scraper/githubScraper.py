from urllib.request import urlopen

from bs4 import BeautifulSoup


class GithubIssue:

    def __init__(self, url):
        html = urlopen(url).read().decode("utf-8")
        soup = BeautifulSoup(html, "html.parser")
        print(soup)

        title = soup.find(class_="js-issue-title").text

        #post = soup.select("td.d-block.comment-body.markdown-body.js-comment-body")
        #print(post)


def main():
    GithubIssue("https://github.com/google/blockly/issues/4617")


if __name__ == "__main__":
    main()