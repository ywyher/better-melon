export type GithubConfig = {
  apiBaseUrl: string
  repositories: {
    jmdictSimplified: string
  }
}

export type GitHubRelease = {
  tag_name: string
  assets: GitHubAsset[]
}

export type GitHubAsset = {
  id: string
  name: string
  browser_download_url: string
}