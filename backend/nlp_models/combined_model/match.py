import json
import sys

def match_score(a_labels, b_labels):
    common_labels = a_labels.keys() & b_labels.keys()
    score = 0.0
    for label in common_labels:
        score += a_labels[label] * b_labels[label]
    return score

"""
    Calculates a match score between each pair of the two arrays of label sets.
    Usage: <match>  '{
        "account_set": {
            <account_id>: [
                {
                    "label": <string>,
                    "probability": <real>
                },
                ...
            ],
            ...
        },
        "task_set: {
            <task_id>: {
                "model_output": [
                    {
                        "label": <string>,
                        "probability": <real>
                    },
                    ...
                ],
                "manual_added_labels": [<string>],
                "manual_deleted_labels": [<string>]
            },
            ...
        }
    }'
    Returns: '{
        "account_set": {
            <account_id>: {
                <task_id>: {
                    "score": <real>
                },
                ...
            },
            ...
        },
        "task_set": {
            <task_id>: {
                <account_id>: {
                    "score": <real>
                },
                ...
            },
            ...
        }
    }'
    Notes: task_ids and account_ids are assumed to be universally unique
    TODO build vectors of accounts and tasks biased by the added & removed
         labels & calculate cosine similarity
"""
if __name__ == "__main__":
    # Parse JSON input
    input_json = json.loads(sys.argv[1])
    account_set, task_set = input_json['account_set'], input_json['task_set']

    # Build dictionary of id -> (label -> prob)
    probs = dict([
            (account_id, dict([
                (label['label'], label['probability'])
                for label in labels
            ]))
            for account_id, labels in account_set.items()
        ] + [
            (task_id, dict([
                (label['label'], label['probability'])
                for label in attr['model_output']
                if label['label'] not in attr['manual_deleted_labels']
            ] + [
                (label, 1.0) for label in attr['manual_added_labels']
            ]))
            for task_id, attr in task_set.items()
    ])
    
    # Calculate pairwise match scores
    output = {
        "account_set": dict([
            (account_id, dict())
            for account_id in account_set.keys()
        ]),
        "task_set": dict([
            (task_id, dict())
            for task_id in task_set.keys()
        ])
    }
    for account_id in account_set.keys():
        for task_id in task_set.keys():
            score = match_score(probs[account_id], probs[task_id])
            output["account_set"][account_id][task_id] = {
                "score": score
            }
            output["task_set"][task_id][account_id] = {
                "score": score
            }

    sys.stdout.write(json.dumps(output))
    sys.stdout.flush()

