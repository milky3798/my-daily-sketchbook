export default function GithubLogin() {

  const saveToken = () => {

    const token = prompt("输入你的 GitHub Token")

    if (token) {
      localStorage.setItem("github_token", token)
      alert("Token 已保存")
    }

  }

  return (
    <button onClick={saveToken}>
      登录 GitHub
    </button>
  )
}
