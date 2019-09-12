const SLACK_TOKEN = process.env.SLACK_TOKEN;

// function formatSlackMessage(query, response) {
//   let entity;
// 
//   // Extract the first entity from the result list, if any
//   if (
//     response &&
//     response.data &&
//     response.data.itemListElement &&
//     response.data.itemListElement.length > 0
//   ) {
//     entity = response.data.itemListElement[0].result;
//   }
// 
//   // Prepare a rich Slack message
//   // See https://api.slack.com/docs/message-formatting
//   const slackMessage = {
//     response_type: 'in_channel',
//     text: `Query: ${query}`,
//     attachments: [],
//   };
// 
//   if (entity) {
//     const attachment = {
//       color: '#3367d6',
//     };
//     if (entity.name) {
//       attachment.title = entity.name;
//       if (entity.description) {
//         attachment.title = `${attachment.title}: ${entity.description}`;
//       }
//     }
//     if (entity.detailedDescription) {
//       if (entity.detailedDescription.url) {
//         attachment.title_link = entity.detailedDescription.url;
//       }
//       if (entity.detailedDescription.articleBody) {
//         attachment.text = entity.detailedDescription.articleBody;
//       }
//     }
//     if (entity.image && entity.image.contentUrl) {
//       attachment.image_url = entity.image.contentUrl;
//     }
//     slackMessage.attachments.push(attachment);
//   } else {
//     slackMessage.attachments.push({
//       text: 'No results match your query...',
//     });
//   }
// 
//   return slackMessage;
// }

async function processRequest(req, res) {
  const text = JSON.parse(req.body).text;
  const args = text.trim().split(/\s+/)

  return {
    response_type: 'in_channel',
    text: JSON.stringify(args),
    attachments: [],
  };
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
    if (req.method !== 'POST') {
      const error = new HTTPError('Only POST requests are accepted');
      error.code = 405;
      throw error;
    }

    // Verify the webhook came from Slack
    if (SLACK_TOKEN && (!req.body || req.body.token !== SLACK_TOKEN)) {
      const error = new HTTPError('Invalid credentials');
      error.code = 401;
      throw error;
    }

    // Create the response
    const response = await processRequest(req, res);

    // Send the formatted message back to Slack
    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(err.code || 500).send(err);
    return Promise.reject(err);
  }
};
