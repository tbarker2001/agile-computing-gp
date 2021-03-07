import json
import sys

from github_scraper import GithubProfile
from scraper_methods import generator_pop
from stack_overflow_scraper import StackOverflowProfile


class UserProfile:

    def __init__(self, user_details):
        "takes the user details dictionary and creates object which is composed of scraper objects"

        self._username = user_details.setdefault("username", "")
        self._links = user_details["links"] if "links" in user_details else {}

        self._stack_profile = None
        self._github_profile = None

        if len(self._links) > 0:
            for link in self._links:

                if "stack_profile" in link["link_type"]:
                    self._stack_profile = StackOverflowProfile(link["url"])

                if "github_profile" in link["link_type"]:
                    self._github_profile = GithubProfile(link["url"])

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

    nasp = profile.get_next_asked_stack_post()

    # Was throwing a "nonetype has no attribute getpost" error
    if nasp is not None:
        output = {
            'text': profile.get_next_asked_stack_post().get_post()
        }
    else:
        output = {
            'text': ""
        }
        sys.stdout.write("post not found")
    sys.stdout.write(json.dumps(output))
