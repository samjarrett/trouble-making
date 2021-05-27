import botocore.session
from botocore.credentials import (
    AssumeRoleCredentialFetcher,
    DeferredRefreshableCredentials,
)
import boto3


def get_boto3_session(assume_role_arn=None):
    session = boto3.Session()
    if not assume_role_arn:
        return session

    fetcher = AssumeRoleCredentialFetcher(
        client_creator=_get_client_creator(session),
        source_credentials=session.get_credentials(),
        role_arn=assume_role_arn,
    )
    botocore_session = botocore.session.Session()
    botocore_session._credentials = DeferredRefreshableCredentials(
        method="assume-role", refresh_using=fetcher.fetch_credentials
    )

    return boto3.Session(botocore_session=botocore_session)


def _get_client_creator(session):
    def client_creator(service_name, **kwargs):
        return session.client(service_name, **kwargs)

    return client_creator
