import json
import sys

from github_scraper import GithubProfile
from stack_overflow_scraper import StackOverflowProfile


class UserProfile:
    """A class used to represent a users scraped data and create the model free text input
    Attributes
    ----------
    _username : str
        the username of the profile
    _links : str list
        the links which need to be scraped for the profile
    _user_free_text : str
        the free text inputted during profile creation
    _stack_profile: StackOverflowProfile
        represents the stack overflow profile
    _github_profile: GithubProfile
        represents the github profile
    """

    def __init__(self, user_details):
        """
        takes the user details dictionary and creates object to represent the users model data

        Parameters
        ----------
        user_details : dict
            The user details dictionary expected in the form
            { 'username': <username>,
             'links':[ {link_type: 'stack_profile', url: <url>}, {link_type: 'github_profile', url: <url>} ],
              freeText: <string> }
        """

        self._username = user_details.setdefault("username", "")
        self._links = user_details["links"] if "links" in user_details else {}
        self._user_free_text = user_details["freeText"] if "freeText" in user_details else ""

        self._stack_profile = None
        self._github_profile = None

        if len(self._links) > 0:
            for link in self._links:

                if "stack_profile" in link["link_type"]:
                    self._stack_profile = StackOverflowProfile(link["url"])

                if "github_profile" in link["link_type"]:
                    self._github_profile = GithubProfile(link["url"])

    def get_username(self):
        """returns the username of the user"""
        return self._username

    def build_model_data(self):
        """builds the model data for the user profile"""
        model_text = ""
        if self._stack_profile is not None:
            model_text += self._stack_profile.get_free_text()
        if self._github_profile is not None:
            model_text += self._github_profile.get_free_text()
        if self._user_free_text is not None:
            model_text += self._user_free_text
        return model_text


if __name__ == "__main__":
    input_json = json.loads(sys.argv[1])
    profile = UserProfile(input_json)

    freetext = profile.build_model_data()

    output = {
        'text': freetext
    }

    sys.stdout.write(json.dumps(output))
