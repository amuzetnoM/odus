
import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GithubService {
  private token = signal<string>(localStorage.getItem('gh_token') || '');

  setToken(token: string) {
    this.token.set(token);
    localStorage.setItem('gh_token', token);
  }

  getToken() {
    return this.token();
  }

  private async fetch(endpoint: string) {
    if (!this.token()) throw new Error('GitHub Token required');
    
    const response = await fetch(`https://api.github.com${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${this.token()}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!response.ok) throw new Error(`GitHub API Error: ${response.statusText}`);
    return response.json();
  }

  async getUserRepos() {
    // Fetch user repos + org repos user has access to
    // We fetch more to allow client-side filtering
    return this.fetch('/user/repos?sort=updated&per_page=100&type=all');
  }

  async getRepoCommits(owner: string, repo: string) {
    return this.fetch(`/repos/${owner}/${repo}/commits?per_page=20`);
  }

  async getRepoTree(owner: string, repo: string, branch: string = 'main') {
    // Get latest commit sha first to get tree
    try {
        const commits = await this.getRepoCommits(owner, repo);
        const sha = commits[0].sha;
        return this.fetch(`/repos/${owner}/${repo}/git/trees/${sha}?recursive=1`);
    } catch (e) {
        // Fallback for empty repos
        return { tree: [] };
    }
  }
  
  async getFileContent(owner: string, repo: string, path: string): Promise<string | null> {
      try {
        const data = await this.fetch(`/repos/${owner}/${repo}/contents/${path}`);
        if (data && data.content) {
            return atob(data.content); // Decode Base64
        }
        return null;
      } catch (e) {
        return null; // File likely doesn't exist
      }
  }
}
