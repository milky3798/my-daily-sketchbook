// GitHub API 交互

export interface GitHubConfig {
  token: string;
  repo: string; // 格式: '用户名/仓库名'
  enabled: boolean;
}

const GITHUB_CONFIG_KEY = 'github_config';

export function getGitHubConfig(): GitHubConfig {
  const raw = localStorage.getItem(GITHUB_CONFIG_KEY);
  if (raw) {
    return JSON.parse(raw);
  }
  return {
    token: '',
    repo: 'milky3798/my-daily-sketchbook', // 默认你的仓库
    enabled: false,
  };
}

export function saveGitHubConfig(config: GitHubConfig): void {
  localStorage.setItem(GITHUB_CONFIG_KEY, JSON.stringify(config));
}

export async function saveToGitHub(
  config: GitHubConfig,
  date: string,
  content: { text: string; mood: string; photos: string[] }
): Promise<boolean> {
  if (!config.enabled || !config.token || !config.repo) {
    return false;
  }

  try {
    // 1. 准备文件内容
    const [year, month, day] = date.split('-');
    const dateObj = new Date(date + 'T00:00:00');
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    const weekday = weekdays[dateObj.getDay()];
    
    // 生成 Markdown 内容
    let markdown = `# ${year}年${month}月${day}日 星期${weekday}\n\n`;
    if (content.mood) {
      markdown += `心情：${content.mood}\n\n`;
    }
    markdown += content.text;
    
    // 2. 处理图片（保存为单独的文件）
    const photoUrls: string[] = [];
    for (let i = 0; i < content.photos.length; i++) {
      const base64Data = content.photos[i];
      // 从 base64 提取图片数据
      const matches = base64Data.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/);
      if (matches) {
        const ext = matches[1];
        const data = matches[2];
        const photoPath = `${year}/${month}/${day}/photo-${i + 1}.${ext}`;
        
        // 上传图片到 GitHub
        await uploadFileToGitHub(config, photoPath, data, true);
        photoUrls.push(`![图片](./photo-${i + 1}.${ext})`);
      }
    }
    
    // 3. 把图片引用添加到 markdown
    if (photoUrls.length > 0) {
      markdown += '\n\n' + photoUrls.join('\n');
    }
    
    // 4. 保存 markdown 文件
    const mdPath = `${year}/${month}/${day}/index.md`;
    const success = await uploadFileToGitHub(
      config,
      mdPath,
      btoa(unescape(encodeURIComponent(markdown))), // 转换为 base64
      false
    );
    
    return success;
  } catch (error) {
    console.error('GitHub 保存失败:', error);
    return false;
  }
}

async function uploadFileToGitHub(
  config: GitHubConfig,
  path: string,
  contentBase64: string,
  isImage: boolean
): Promise<boolean> {
  try {
    // 1. 先检查文件是否存在，获取 sha
    let sha: string | undefined;
    const getUrl = `https://api.github.com/repos/${config.repo}/contents/${path}`;
    const getResponse = await fetch(getUrl, {
      headers: {
        Authorization: `token ${config.token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });
    
    if (getResponse.ok) {
      const data = await getResponse.json();
      sha = data.sha;
    }
    
    // 2. 上传/更新文件
    const putUrl = `https://api.github.com/repos/${config.repo}/contents/${path}`;
    const putResponse = await fetch(putUrl, {
      method: 'PUT',
      headers: {
        Authorization: `token ${config.token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `随记：更新 ${path}`,
        content: contentBase64,
        sha: sha,
        branch: 'main',
      }),
    });
    
    return putResponse.ok;
  } catch (error) {
    console.error('上传文件失败:', error);
    return false;
  }
}

// 验证 GitHub Token 是否有效
export async function validateGitHubToken(token: string, repo: string): Promise<boolean> {
  try {
    const response = await fetch(`https://api.github.com/repos/${repo}`, {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });
    return response.ok;
  } catch {
    return false;
  }
}
