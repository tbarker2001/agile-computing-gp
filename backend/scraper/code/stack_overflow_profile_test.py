import unittest

from stack_overflow_scraper import StackOverflowProfile


class TestStackOverFlowProfile(unittest.TestCase):
    def setUp(self):
        self._links = ["https://stackoverflow.com/users/12870/oli", "https://stackoverflow.com/users/87234/gmannickg",
                       "https://stackoverflow.com/users/87234/gmannickg"]

    def test_username(self):
        test_data = [(str(StackOverflowProfile(link)), link[link.rfind("/") + 1:]) for link in self._links]
        for profile_name, username in test_data:
            self.assertEqual(profile_name, username)


if __name__ == '__main__':
    unittest.main()
