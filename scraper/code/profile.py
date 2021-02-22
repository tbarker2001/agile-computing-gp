import json
import sys
from scraper.code.stackOverflowScraper import StackOverflowProfile


class UserProfile:

    def __init__(self, user_details):
        "takes the user details dictionary and creates object which is composed of scraper objects"

        self._username = user_details["username"]

        self._stack_profile = StackOverflowProfile(
            user_details["stack_profile"]) if "stack_profile" in user_details else None

    def get_next_stack_tag(self):
        return self._stack_profile.getTopTags().__next__() if self._stack_profile is not None else None

    def get_next_asked_stack_post(self):
        return self._stack_profile.getAskedPosts().__next__() if self._stack_profile is not None else None

    def get_next_answered_stack_post(self):
        return self._stack_profile.getAnsweredPosts().__next__() if self._stack_profile is not None else None

    def get_username(self):
        return self._username


# todo create more comprehensive tests
def test_user_profile():
    with open("/scraper/profile_test.json") as json_file:
        data = json.load(json_file)

        UserProfile(json.load(json_file))


if __name__ == "__main__":
    input_json = json.loads(sys.argv[1])
    profile = UserProfile(input_json)
