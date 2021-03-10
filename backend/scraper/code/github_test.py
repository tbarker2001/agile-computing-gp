import unittest

from github_scraper import GithubProfile, GithubIssue, GithubCommit


class GithubTest(unittest.TestCase):
    def setUp(self):
        self._links = ["https://github.com/clementmihailescu", "https://github.com/tbarker2001",
                       "https://github.com/mgm52"]

    def test_username(self):
        test_data = [(str(GithubProfile(link)), link[link.rfind("/") + 1:]) for link in self._links]
        for profile_name, username in test_data:
            self.assertEqual(profile_name, username)

    def test_commit(self):
        commit_text = [[' nlp_labels: [],', ' is_admin: this.state.username === "admin"']]

        commit_links = ["https://github.com/tbarker2001/agile-computing-gp/commit"
                        "/2ff81caecc88bbe36af5def2f7dddc1991bd5fcd"]
        commits = [GithubCommit(link) for link in commit_links]
        for i, commit in enumerate(commits):
            code_lines = commit.get_code_lines()
            self.assertEqual(len(code_lines), len(commit_text[i]))

            for j in range(len(code_lines)):
                self.assertEqual(commit_text[i][j], code_lines[j])

    def test_issue(self):
        issue_text = [
            "Individual task view if 're the creator or an admin , additionally : The text was updated successfully , "
            "but these errors were encountered :",
            "Scraping tagged StackOverflow free text Need a Python script scraping StackOverflow discussions in a "
            "subset of tags , and writing to a text file . Produce a document of the tags selected . Tags need the "
            "prefix   label   to be processed by .The text was updated successfully , but these errors were "
            "encountered :"]

        issue_links = ["https://github.com/tbarker2001/agile-computing-gp/issues/36",
                       "https://github.com/tbarker2001/agile-computing-gp/issues/2"]
        issues = [GithubIssue(link) for link in issue_links]
        for i, issue in enumerate(issues):
            self.assertEqual(issue.get_free_text(), issue_text[i])


if __name__ == '__main__':
    unittest.main()
