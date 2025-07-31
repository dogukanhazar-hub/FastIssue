const axios = require('axios');

class GiteeAPI {
  constructor(token) {
    this.token = token;
    this.baseURL = 'https://gitee.com/api/v5';
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'User-Agent': 'issue-creator-cli'
      }
    });
  }

  async createIssue(owner, repo, title, body, labels = []) {
    try {
      const response = await this.client.post(`/repos/${owner}/${repo}/issues`, {
        access_token: this.token,
        title,
        body,
        labels: labels.filter(label => label.trim() !== '').join(',')
      });
      return response.data;
    } catch (error) {
      throw new Error(`Gitee API Error: ${error.response?.data?.message || error.message}`);
    }
  }

  async updateIssue(owner, repo, issueNumber, title, body, state, labels = []) {
    try {
      const updateData = {
        access_token: this.token
      };
      
      if (title) updateData.title = title;
      if (body) updateData.body = body;
      if (state) {
        // Gitee uses 'open', 'progressing', or 'closed'
        updateData.state = state;
      }
      if (labels.length > 0) {
        updateData.labels = labels.filter(label => label.trim() !== '').join(',');
      }

      const response = await this.client.patch(`/repos/${owner}/${repo}/issues/${issueNumber}`, updateData);
      return response.data;
    } catch (error) {
      throw new Error(`Gitee API Error: ${error.response?.data?.message || error.message}`);
    }
  }

  async listIssues(owner, repo, state = 'open') {
    try {
      const response = await this.client.get(`/repos/${owner}/${repo}/issues`, {
        params: {
          access_token: this.token,
          state: state,
          per_page: 100
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Gitee API Error: ${error.response?.data?.message || error.message}`);
    }
  }
}

module.exports = GiteeAPI;