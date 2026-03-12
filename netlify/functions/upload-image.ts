export async function handler(event) {
  const token = process.env.GITHUB_TOKEN;
  const repo = "milky3798/my-daily-sketchbook";

  const body = JSON.parse(event.body);

  const filename = body.filename;
  const content = body.content;

  const url = `https://api.github.com/repos/${repo}/contents/images/${filename}`;

  await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `token ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: "upload image",
      content: content
    }),
  });

  return {
    statusCode: 200,
    body: JSON.stringify({
      url: `https://raw.githubusercontent.com/${repo}/main/images/${filename}`
    })
  };
}
