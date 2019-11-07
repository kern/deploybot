import * as Octokit from "@octokit/rest";

const SLACK_TOKEN = process.env.SLACK_TOKEN;
const [GITHUB_OWNER, GITHUB_REPO] = process.env.GITHUB_REPO.split("/");

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});

// TODO(@kern): Make this configurable.
const ENVIRONMENTS = ['staging', 'production'];

async function processStatusRequest() {
  let text = `Deployment environments for _${GITHUB_OWNER}/${GITHUB_REPO}_\n\n`
  for (const env of ENVIRONMENTS) {
    text += `- *${env}*\n`
  }

  return {
    response_type: 'in_channel',
    text
  }
}

async function processRequest(args) {
  if (args.length === 0) {
    return processStatusRequest();
  }

  const env = args[0];
  const ref = args[1] || 'master';

  if (!ENVIRONMENTS.includes(env)) {
    return {
      response_type: 'in_channel',
      text: `Invalid environment ${env}. Must be one of: ${ENVIRONMENTS.join(', ')}`
    }
  }

  try {
    const res = await octokit.repos.createDeployment({
      description: `Deploying ${ref} to ${env}`,
      owner: GITHUB_OWNER,
      ref,
      repo: GITHUB_REPO,
      environment: env
    });

    return {
      response_type: "in_channel",
      attachments: [
        {
          title: 'Deployment started!',
          title_link: `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/deployments`,
          color: '#00FF00',
          fields: [
            {
              title: 'Environment',
              value: env,
              short: true
            },
            {
              title: 'Git Ref',
              value: ref,
              short: true
            }
          ]
        }
      ]
    }
  } catch (err) {
    console.error(err)

    return {
      response_type: 'in_channel',
      attachments: [
        {
          title: 'Failed to deploy!',
          color: '#FF0000',
          fields: [
            {
              title: 'Environment',
              value: env,
              short: true
            },
            {
              title: 'Git Ref',
              value: ref,
              short: true
            },
            {
              title: 'Error',
              value: err.message,
              short: false
            }
          ]
        }
      ]
    }
  }
}

class HTTPError extends Error {
  public code: number;

  constructor(m: string) {
    super(m);

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, HTTPError.prototype);
  }
}

export async function main(req, res) {
  try {
    if (req.method !== "POST") {
      const error = new HTTPError("Only POST requests are accepted");
      error.code = 405;
      throw error;
    }

    // Verify the webhook came from Slack
    if (SLACK_TOKEN && (!req.body || req.body.token !== SLACK_TOKEN)) {
      const error = new HTTPError("Invalid credentials");
      error.code = 401;
      throw error;
    }

    // Create the response
    const text = req.body.text;
    const args = text.trim().split(/\s+/).filter(s => s !== '');
    const response = await processRequest(args);

    // Send the formatted message back to Slack
    res.json(response);
  } catch (err) {
    console.error(err); // tslint:disable-line no-console
    res.status(err.code || 500).send(err);
    return Promise.reject(err);
  }
}
