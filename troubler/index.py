import os
import json

from assume_role import get_boto3_session


ROLE_ARN = os.environ["ROLE_ARN"]
SESSION = get_boto3_session(ROLE_ARN)


def hello(name):
    print(f"hello {name}")
    print(json.dumps(SESSION.client("sts").get_caller_identity()))


def handler(event, context):
    """The lamdba entry point"""
    for record in event["Records"]:
        message = record["Sns"]
        attributes = message.get("MessageAttributes", {})

        if "account" in attributes:
            print(f"Processing command for account {attributes['account']['Value']}")

        print(json.dumps(message))

        if "{" not in message["Message"]:
            return

        message_json = json.loads(message["Message"])
        if "method" not in message_json:
            return

        if message_json["method"] in globals():
            method = message_json["method"]
            args = message_json.get("args", [])
            globals()[method](*args)
