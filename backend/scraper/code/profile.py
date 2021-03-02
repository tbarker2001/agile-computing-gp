import json
import sys

from backend.scraper.code.github_scraper import GithubProfile
from backend.scraper.code.parsing_methods import generator_pop
from backend.scraper.code.stack_overflow_scraper import StackOverflowProfile


class UserProfile:
    _stack_profile = None
    _github_profile = None

    def __init__(self, user_details):
        "takes the user details dictionary and creates object which is composed of scraper objects"

        self._username = user_details["username"]
        self._links = user_details["links"] if "links" in user_details else {}

        if len(self._links) > 0:
            if "stack_profile" in user_details["links"]:
                self._stack_profile = StackOverflowProfile(self._links["stack_profile"])

            if "github_profile" in user_details["links"]:
                self._github_profile = GithubProfile(self._links["github_profile"])

    def get_next_stack_tag(self):
        return generator_pop(self._stack_profile.get_top_tags()) if self._stack_profile is not None else None

    def get_next_asked_stack_post(self):
        return generator_pop(self._stack_profile.get_asked_posts()) if self._stack_profile is not None else None

    def get_next_answered_stack_post(self):
        return generator_pop(self._stack_profile.get_answered_posts()) if self._stack_profile is not None else None

    def get_username(self):
        return self._username

    def build_model_data(self):
        freetext = ""
        if self._stack_profile is not None:
            freetext += self._stack_profile.get_free_text()
        if self._github_profile is not None:
            freetext += self._github_profile.get_free_text()
        return freetext


if __name__ == "__main__":
    input_json = json.loads(sys.argv[1])
    profile = UserProfile(input_json)
    output = {
        'text': profile.get_next_asked_stack_post().getPost()
    }
    sys.stdout.write(json.dumps(output))
