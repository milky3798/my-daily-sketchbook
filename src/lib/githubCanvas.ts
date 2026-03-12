const OWNER = "milky3798"
const REPO = "my-daily-sketchbook"
const BRANCH = "main"

const TOKEN = localStorage.getItem("github_token")

export async function saveCanvas(date: string, data: any) {

  const path = `canvas-data/${date}.json`

  const content = btoa(
    JSON.stringify(data, null, 2)
  )

  let sha = null

  const res = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`
  )

  if (res.status === 200) {
    const file = await res.json()
    sha = file.sha
  }

  await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: `save canvas ${date}`,
        content,
        sha,
        branch: BRANCH
      })
    }
  )
}

export async function loadCanvas(date: string) {

  const path = `canvas-data/${date}.json`

  const res = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`
  )

  if (res.status !== 200) {
    return null
  }

  const file = await res.json()

  const decoded = atob(file.content)

  return JSON.parse(decoded)
}
