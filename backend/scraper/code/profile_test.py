import json
import unittest
from user_profile import UserProfile


class TestProfile(unittest.TestCase):

    def setUp(self):
        with open("profile_example.json") as json_file:
            self._profiles_json = json.load(json_file)

        self._profiles = {UserProfile(data) for data in self._profiles_json.values()}

    def test_username(self):
        test_data = [(UserProfile(data), data["username"]) for data in self._profiles_json.values()]

        for profile, username in test_data:
            self.assertEqual(profile.get_username(), username)


if __name__ == '__main__':
    unittest.main()
