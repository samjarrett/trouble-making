import * as cdk from '@aws-cdk/core';
import * as sns from '@aws-cdk/aws-sns';
import * as iam from '@aws-cdk/aws-iam';
import { PerAccountConsumerConstruct } from './per-account-consumer';

export interface AccountRole {
  readonly accountId: string;
  readonly role: iam.LazyRole;
}

export interface OrchestratorStackProps extends cdk.StackProps {
  readonly accountRoles: AccountRole[];
}

export class OrchestratorStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: OrchestratorStackProps) {
    super(scope, id, props);

    const topic = new sns.Topic(this, "CommandTopic");

    for (const accountRole of props.accountRoles) {
      new PerAccountConsumerConstruct(this, `PerAccountConsumer${accountRole.accountId}`, {
        accountId: accountRole.accountId,
        role: accountRole.role,
        topic: topic,
      });
    }
  }
}
