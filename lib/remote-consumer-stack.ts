import * as cdk from '@aws-cdk/core';
import * as iam from '@aws-cdk/aws-iam';

export interface RemoteConsumerStackProps extends cdk.StackProps {
    readonly orchestratorAccountId: string;
}

export class RemoteConsumerStack extends cdk.Stack {
    public role: iam.LazyRole;

    constructor(scope: cdk.Construct, id: string, props: RemoteConsumerStackProps) {
        super(scope, id, props);

        this.role = new iam.LazyRole(this, "OrchestrationRole", {
            roleName: cdk.PhysicalName.GENERATE_IF_NEEDED,
            assumedBy: new iam.AccountPrincipal(props.orchestratorAccountId),
            managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName("AdministratorAccess")]
        });
    }
}
