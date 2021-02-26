import unittest

from backend.scraper.code import stackOverflowScraper as stoScraper


class TestStackOverFlowPost(unittest.TestCase):
    def setUp(self):
        data = ["https://stackoverflow.com/questions/11227809/why-is-processing-a-sorted-array-faster-than-processing"
                "-an-unsorted-array",
                "https://stackoverflow.com/questions/927358/how-do-i-undo-the-most-recent-local-commits-in-git",
                "https://stackoverflow.com/questions/2003505/how-do-i-delete-a-git-branch-locally-and-remotely"]
        self._posts = [stoScraper.StackOverflowPost(link) for link in data]

    def test_post_title(self):
        """
        Test that it can return the correct titles
        """

        titles = ["Why is processing a sorted array faster than processing an unsorted array?",
                  "How do I undo the most recent local commits in Git?",
                  "How do I delete a Git branch locally and remotely?"]

        for i, post in enumerate(self._posts):
            self.assertEqual(post.getTitle(), titles[i])

    def test_post_tags(self):
        """
        Test that it can return the correct post tags
        """
        tags = [{"java", "c++", "performance", "optimization", "branch-prediction"},
                {"git", "version-control", "git-commit", "undo"},
                {"git", "version-control", "git-branch", "git-push", "git-remote"}]

        for i, post in enumerate(self._posts):
            self.assertEqual(post.getPostTags(), tags[i])

    def test_post_text(self):
        """
        Test that it can return the correct post tags
        """
        post_text = [
            "Here is a piece of C++ code that shows some very peculiar behavior. For some strange reason, sorting the "
            "data miraculously makes the code almost six times faster: Initially, I thought this might be just a "
            "language or compiler anomaly, so I tried Java: With a similar but less extreme result. My first thought "
            "was that sorting brings the data into the cache, but then I thought how silly that was because the array "
            "was just generated. The code is summing up some independent terms, so the order should not matter.",
            "I accidentally committed the wrong files to Git, but didn't push the commit to the server yet. How can I "
            "undo those commits from the local repository?",
            "I want to delete a branch both locally and remotely. What should I do differently to successfully delete "
            "the remotes/origin/bugfix branch both locally and remotely?"]

        for i, post in enumerate(self._posts):
            self.assertEqual(post.getPost(), post_text[i])

    def test_post_first_answer(self):
        """
        Test that it can return the correct post tags
        """
        first_answer = ["You are a victim of branch prediction fail. Consider a railroad junction:  Image by Mecanismo, via Wikimedia Commons. Used under the CC-By-SA 3.0 license. Now for the sake of argument, suppose this is back in the 1800s - before long distance or radio communication. You are the operator of a junction and you hear a train coming. You have no idea which way it is supposed to go. You stop the train to ask the driver which direction they want. And then you set the switch appropriately. Trains are heavy and have a lot of inertia. So they take forever to start up and slow down. Is there a better way? You guess which direction the train will go! If you guess right every time, the train will never have to stop. If you guess wrong too often, the train will spend a lot of time stopping, backing up, and restarting. Consider an if-statement: At the processor level, it is a branch instruction:  You are a processor and you see a branch. You have no idea which way it will go. What do you do? You halt execution and wait until the previous instructions are complete. Then you continue down the correct path. Modern processors are complicated and have long pipelines. So they take forever to \"warm up\" and \"slow down\". Is there a better way? You guess which direction the branch will go! If you guess right every time, the execution will never have to stop. If you guess wrong too often, you spend a lot of time stalling, rolling back, and restarting. This is branch prediction. I admit it's not the best analogy since the train could just signal the direction with a flag. But in computers, the processor doesn't know which direction a branch will go until the last moment. So how would you strategically guess to minimize the number of times that the train must back up and go down the other path? You look at the past history! If the train goes left 99% of the time, then you guess left. If it alternates, then you alternate your guesses. If it goes one way every three times, you guess the same... In other words, you try to identify a pattern and follow it. This is more or less how branch predictors work. Most applications have well-behaved branches. So modern branch predictors will typically achieve >90% hit rates. But when faced with unpredictable branches with no recognizable patterns, branch predictors are virtually useless. Further reading: \"Branch predictor\" article on Wikipedia. Notice that the data is evenly distributed between 0 and 255. When the data is sorted, roughly the first half of the iterations will not enter the if-statement. After that, they will all enter the if-statement. This is very friendly to the branch predictor since the branch consecutively goes the same direction many times. Even a simple saturating counter will correctly predict the branch except for the few iterations after it switches direction. Quick visualization: However, when the data is completely random, the branch predictor is rendered useless, because it can't predict random data. Thus there will probably be around 50% misprediction (no better than random guessing). So what can be done? If the compiler isn't able to optimize the branch into a conditional move, you can try some hacks if you are willing to sacrifice readability for performance. Replace: with: This eliminates the branch and replaces it with some bitwise operations. (Note that this hack is not strictly equivalent to the original if-statement. But in this case, it's valid for all the input values of data[].) Benchmarks: Core i7 920 @ 3.5 GHz C++ - Visual Studio 2010 - x64 Release Java - NetBeans 7.1.1 JDK 7 - x64 Observations: A general rule of thumb is to avoid data-dependent branching in critical loops (such as in this example). Update: GCC 4.6.1 with -O3 or -ftree-vectorize on x64 is able to generate a conditional move. So there is no difference between the sorted and unsorted data - both are fast. (Or somewhat fast: for the already-sorted case, cmov can be slower especially if GCC puts it on the critical path instead of just add, especially on Intel before Broadwell where cmov has 2 cycle latency: gcc optimization flag -O3 makes code slower than -O2) VC++ 2010 is unable to generate conditional moves for this branch even under /Ox. Intel C++ Compiler (ICC) 11 does something miraculous. It interchanges the two loops, thereby hoisting the unpredictable branch to the outer loop. So not only is it immune to the mispredictions, it is also twice as fast as whatever VC++ and GCC can generate! In other words, ICC took advantage of the test-loop to defeat the benchmark... If you give the Intel compiler the branchless code, it just out-right vectorizes it... and is just as fast as with the branch (with the loop interchange). This goes to show that even mature modern compilers can vary wildly in their ability to optimize code...",
                        "This command is responsible for the undo. It will undo your last commit while leaving your working tree (the state of your files on disk) untouched. You'll need to add them again before you can commit them again). Make corrections to working tree files. git add anything that you want to include in your new commit. Commit the changes, reusing the old commit message. reset copied the old head to .git/ORIG_HEAD; commit with -c ORIG_HEAD will open an editor, which initially contains the log message from the old commit and allows you to edit it. If you do not need to edit the message, you could use the -C option. Alternatively, to edit the previous commit (or just its commit message), commit --amend will add changes within the current index to the previous commit. To remove (not revert) a commit that has been pushed to the server, rewriting history with git push origin master --force is necessary. How can I move HEAD back to a previous location? (Detached head) & Undo commits The above answer will show you git reflog, which you can use to determine the SHA-1 for the commit to which you wish to revert. Once you have this value, use the sequence of commands as explained above. HEAD~ is the same as HEAD~1. The article What is the HEAD in git? is helpful if you want to uncommit multiple commits.",
                        "Note that in most cases the remote name is origin. In such a case you'll have to use the command like so. To delete the local branch use one of the following: Note: The -d option is an alias for --delete, which only deletes the branch if it has already been fully merged in its upstream branch. You could also use -D, which is an alias for --delete --force, which deletes the branch \"irrespective of its merged status.\" [Source: man git-branch] Also note that git branch -d branch_name will fail if you are currently in the branch you want to remove. The message starts with error: Cannot delete the branch 'branch_name'. If so, first switch to some other branch, for example: git checkout master. As of Git v1.7.0, you can delete a remote branch using which might be easier to remember than which was added in Git v1.5.0 \"to delete a remote branch or a tag.\" Starting on Git v2.8.0 you can also use git push with the -d option as an alias for --delete. Therefore, the version of Git you have installed will dictate whether you need to use the easier or harder syntax. From Chapter 3 of Pro Git by Scott Chacon: Suppose you’re done with a remote branch — say, you and your collaborators are finished with a feature and have merged it into your remote’s master branch (or whatever branch your stable code-line is in). You can delete a remote branch using the rather obtuse syntax git push [remotename] :[branch]. If you want to delete your server-fix branch from the server, you run the following: Boom. No more branches on your server. You may want to dog-ear this page, because you’ll need that command, and you’ll likely forget the syntax. A way to remember this command is by recalling the git push [remotename] [localbranch]:[remotebranch] syntax that we went over a bit earlier. If you leave off the [localbranch] portion, then you’re basically saying, “Take nothing on my side and make it be [remotebranch].” I issued git push origin: bugfix and it worked beautifully. Scott Chacon was right—I will want to dog ear that page (or virtually dog ear by answering this on Stack Overflow). Then you should execute this on other machines to propagate changes."]

        for i, post in enumerate(self._posts):
            self.assertEqual(post.getAnswers()[0], first_answer[i])


if __name__ == '__main__':
    unittest.main()
