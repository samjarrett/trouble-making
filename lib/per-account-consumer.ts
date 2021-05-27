import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as sns from '@aws-cdk/aws-sns';
import * as subscriptions from '@aws-cdk/aws-sns-subscriptions';
import * as logs from '@aws-cdk/aws-logs';
import * as iam from '@aws-cdk/aws-iam';

export interface PerAccountConsumerProps extends cdk.StackProps {
  readonly accountId: string;
  readonly topic: sns.Topic;
  readonly role: iam.LazyRole;
}

export class PerAccountConsumerConstruct extends cdk.Construct {
  constructor(scope: cdk.Construct, id: string, props: PerAccountConsumerProps) {
    super(scope, id);

    const listener = new lambda.Function(this, 'Listener', {
      handler: 'index.handler',
      runtime: lambda.Runtime.PYTHON_3_8,
      code: lambda.Code.fromAsset("troubler/"),
      environment: {
        ROLE_ARN: props.role.roleArn,
      }
    });
    listener.addToRolePolicy(new iam.PolicyStatement({
      actions: ["sts:AssumeRole"],
      resources: [props.role.roleArn]
    }));
    new logs.LogGroup(this, "LogGroup", { logGroupName: `/aws/lambda/${listener.functionName}`, retention: 7 });

    const filterMatches = ["all", props.accountId]
    props.topic.addSubscription(new subscriptions.LambdaSubscription(listener, {
      filterPolicy: {
        account: sns.SubscriptionFilter.stringFilter({ allowlist: filterMatches })
      },
    }));
  }
}
