# Deploybot

A Google Cloud Function-based deployment bot for Slack.

## Quickstart

1. Build deploybot:

    $ make deps
    $ make build

2. Deploy deploybot to Google Cloud Functions:

    $ make deploy

3. Find the url of your function. It should look something like this: `https://us-central1-kern-io.cloudfunctions.net/deploybot`

4. Create a new *Slash Command* [Slack App](https://api.slack.com/apps) for deploybot.

5. Enter `/deploy` as the name of the command.

6. Enter the URL for your deploybot function as the URL for the *Slash Command*.

7. Give your command a description and save.

8. Add the new Slack app to your workspace using **Settings > Install App > Install App to Workspace > Allow**.

9. Populate the `SLACK_TOKEN` value found in `.env.yaml`. You can find the value under **Settings > Basic Information > App Credentials > Verification Token**.

10. Create a [personal GitHub access token](https://github.com/settings/tokens/new) with the `repo_deployment`. Place it in the `GITHUB_TOKEN` env var in `.env.yaml`.

11. Populate the repository you'd like to have deployed in `.env.yaml`.

10. Redeploy the Cloud Function using `make deploy`.

10. Woot you are done!

## License

Apache 2.0
