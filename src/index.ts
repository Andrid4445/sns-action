import * as core from '@actions/core';
import * as github from '@actions/github';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

async function run(): Promise<void> {
  try {
    // Get inputs
    const topicArn = core.getInput('topicArn', { required: true });
    const message = core.getInput('message', { required: true });
    const subject = core.getInput('subject');
    const region = core.getInput('region', { required: true });

    // Create SNS client
    const client = new SNSClient({ region });

    // Prepare message parameters
    const params = {
      TopicArn: topicArn,
      Message: message,
      Subject: subject || undefined,
    };

    // Send message
    const command = new PublishCommand(params);
    const response = await client.send(command);

    // Set output
    if (response.MessageId) {
      core.setOutput('notificationId', response.MessageId);
      core.info(`Message published with ID: ${response.MessageId}`);
    } else {
      throw new Error('Failed to get MessageId from SNS publish response');
    }

    // Log GitHub context (optional, for debugging)
    core.debug(JSON.stringify(github.context, null, 2));
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
  }
}

run();
