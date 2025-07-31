const axios = require('axios');

class GitHubAPI {
  constructor(token) {
    this.token = token;
    this.baseURL = 'https://api.github.com';
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'issue-creator-cli'
      }
    });
  }

  async createIssue(owner, repo, title, body, labels = []) {
    try {
      const response = await this.client.post(`/repos/${owner}/${repo}/issues`, {
        title,
        body,
        labels: labels.filter(label => label.trim() !== '')
      });
      return response.data;
    } catch (error) {
      throw new Error(`GitHub API Error: ${error.response?.data?.message || error.message}`);
    }
  }

  async updateIssue(owner, repo, issueNumber, title, body, state, labels = []) {
    try {
      const updateData = {};
      
      if (title) updateData.title = title;
      if (body) updateData.body = body;
      if (state) {
        // GitHub uses 'open' or 'closed'
        const githubState = state === 'progressing' ? 'open' : state;
        updateData.state = githubState;
      }
      if (labels.length > 0) {
        updateData.labels = labels.filter(label => label.trim() !== '');
      }

      const response = await this.client.patch(`/repos/${owner}/${repo}/issues/${issueNumber}`, updateData);
      return response.data;
    } catch (error) {
      throw new Error(`GitHub API Error: ${error.response?.data?.message || error.message}`);
    }
  }

  async listIssues(owner, repo, state = 'open') {
    try {
      const response = await this.client.get(`/repos/${owner}/${repo}/issues`, {
        params: {
          state: state === 'all' ? 'all' : state,
          per_page: 100
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(`GitHub API Error: ${error.response?.data?.message || error.message}`);
    }
  }
}

module.exports = GitHubAPI;