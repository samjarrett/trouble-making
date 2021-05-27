#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { OrchestratorStack, AccountRole } from '../lib/orchestrator-stack';
import { RemoteConsumerStack } from '../lib/remote-consumer-stack';

const ORCHESTRATOR_ACCOUNT_ID = process.env.ORCHESTRATOR_ACCOUNT_ID;
const REGION = process.env.CDK_DEFAULT_REGION;
const accountIds = process.env.CHILD_ACCOUNT_IDS?.split(/[ ,]+/).filter(Boolean);

if (!ORCHESTRATOR_ACCOUNT_ID) {
  console.log("No orchestrator account ID provided")
  process.exit(1);
}
if (!accountIds) {
  console.log("No account IDs provided")
  process.exit(1);
}

const app = new cdk.App();

const accountRoles: AccountRole[] = []

for (const account of accountIds) {
  const remoteConsumerStack = new RemoteConsumerStack(app, 'ConsumerStack', {
    env: {
      account: account, region: REGION
    },
    orchestratorAccountId: ORCHESTRATOR_ACCOUNT_ID,
  });
  accountRoles.push({ accountId: account, role: remoteConsumerStack.role });
}

const orchestratorStack = new OrchestratorStack(app, 'OrchestratorStack', {
  env: { account: ORCHESTRATOR_ACCOUNT_ID, region: REGION },
  accountRoles: accountRoles,
});
