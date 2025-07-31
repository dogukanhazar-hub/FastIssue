const GitHubAPI = require('./github');
const GiteeAPI = require('./gitee');

class APIFactory {
  static createAPI(platform, token) {
    switch (platform.toLowerCase()) {
      case 'github':
        return new GitHubAPI(token);
      case 'gitee':
        return new GiteeAPI(token);
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }
}

module.exports = APIFactory;