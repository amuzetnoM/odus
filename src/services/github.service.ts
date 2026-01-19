
import { Injectable, signal } from '@angular/core';
import { Task } from './project.service';

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body: string;
  state: 'open' | 'closed';
  labels: Array<{ name: string }>;
  created_at: string;
  updated_at: string;
  html_url: string;
}

export interface GitHubProject {
  id: number;
  name: string;
  body: string;
  state: 'open' | 'closed';
  html_url: string;
}

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

  private async fetch(endpoint: string, method: string = 'GET', body?: any) {
    if (!this.token()) throw new Error('GitHub Token required');
    
    const options: RequestInit = {
      method,
      headers: {
        'Authorization': `Bearer ${this.token()}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      }
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`https://api.github.com${endpoint}`, options);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`GitHub API Error: ${response.statusText} - ${error}`);
    }
    
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

  async validateConnection(token: string): Promise<boolean> {
     if (!token) return true;
     
    try {
      const response = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async getIssues(owner: string, repo: string, state: 'open' | 'closed' | 'all' = 'open'): Promise<GitHubIssue[]> {
    return this.fetch(`/repos/${owner}/${repo}/issues?state=${state}&per_page=100`);
  }

  async createIssue(owner: string, repo: string, task: Task): Promise<GitHubIssue> {
    const body = {
      title: task.title,
      body: this.formatTaskAsMarkdown(task),
      labels: task.tags || []
    };

    return this.fetch(`/repos/${owner}/${repo}/issues`, 'POST', body);
  }

  async updateIssue(owner: string, repo: string, issueNumber: number, task: Task): Promise<GitHubIssue> {
    const body = {
      title: task.title,
      body: this.formatTaskAsMarkdown(task),
      state: task.status === 'done' ? 'closed' : 'open',
      labels: task.tags || []
    };

    return this.fetch(`/repos/${owner}/${repo}/issues/${issueNumber}`, 'PATCH', body);
  }

  async closeIssue(owner: string, repo: string, issueNumber: number): Promise<GitHubIssue> {
    return this.fetch(`/repos/${owner}/${repo}/issues/${issueNumber}`, 'PATCH', {
      state: 'closed'
    });
  }

  private formatTaskAsMarkdown(task: Task): string {
    let markdown = task.description || '';
    
    markdown += '\n\n---\n';
    markdown += `**Priority:** ${task.priority}\n`;
    markdown += `**Status:** ${task.status}\n`;
    
    if (task.startDate) {
      markdown += `**Start Date:** ${task.startDate}\n`;
    }
    
    if (task.endDate) {
      markdown += `**Due Date:** ${task.endDate}\n`;
    }

    if (task.dependencyIds && task.dependencyIds.length > 0) {
      markdown += `**Dependencies:** ${task.dependencyIds.length} task(s)\n`;
    }

    markdown += `\n_Synced from ODUS Project Management_`;
    
    return markdown;
  }

  async getProjects(owner: string, repo: string): Promise<GitHubProject[]> {
    try {
      return await this.fetch(`/repos/${owner}/${repo}/projects`, 'GET');
    } catch (e) {
      console.warn('GitHub Projects API may require additional permissions', e);
      return [];
    }
  }

  async createProject(owner: string, repo: string, name: string, body: string): Promise<GitHubProject> {
    return this.fetch(`/repos/${owner}/${repo}/projects`, 'POST', {
      name,
      body
    });
  }

  async syncTaskToGitHub(owner: string, repo: string, task: Task, issueNumber?: number): Promise<GitHubIssue> {
    if (issueNumber) {
      return this.updateIssue(owner, repo, issueNumber, task);
    } else {
      return this.createIssue(owner, repo, task);
    }
  }

  parseTaskFromIssue(issue: GitHubIssue): Partial<Task> {
    return {
      title: issue.title,
      description: issue.body || '',
      status: issue.state === 'closed' ? 'done' : 'todo',
      priority: this.extractPriorityFromLabels(issue.labels),
      tags: issue.labels.map(l => l.name.toUpperCase()),
      createdAt: issue.created_at
    };
  }

  private extractPriorityFromLabels(labels: Array<{ name: string }>): 'low' | 'medium' | 'high' {
    const priorityLabels = labels.map(l => l.name.toLowerCase());
    
    if (priorityLabels.some(l => l.includes('high') || l.includes('urgent') || l.includes('critical'))) {
      return 'high';
    }
    if (priorityLabels.some(l => l.includes('low') || l.includes('minor'))) {
      return 'low';
    }
    return 'medium';
  }
}
