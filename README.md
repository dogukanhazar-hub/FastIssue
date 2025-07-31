# Issue Creator CLI

A powerful CLI tool for managing issues across GitHub and Gitee platforms with secure credential storage and command autocompletion.

## Features

- ✅ **Multi-platform Support**: Works with both GitHub and Gitee APIs
- 🔒 **Secure Storage**: Credentials encrypted using SQLCipher
- 🚀 **Command Aliases**: Short and long aliases for all commands
- 📝 **Autocompletion**: Bash completion script for enhanced productivity
- ⚙️ **Configuration Management**: Save and manage multiple repository configurations
- 🎨 **Rich CLI Experience**: Colored output, loading spinners, and progress indicators

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd issue-creator

# Install dependencies
npm install

# Make the CLI globally available
npm link

# Enable bash completion (optional)

# For most Linux distributions (bash-completion must be installed):
sudo cp completion/issue-creator-completion.bash /etc/bash_completion.d/

# Or, for local user setup without sudo:
echo "source ~/path/to/issue-creator/completion/issue-creator-completion.bash" >> ~/.bashrc
source ~/.bashrc

# If you don't have bash-completion installed, you can install it:

# Debian/Ubuntu:
sudo apt install bash-completion

# macOS (with Homebrew):
brew install bash-completion
```

## Quick Start

### 1. Add a Repository Configuration

```bash
# Interactive setup
issue-creator config add

# Or with flags
issue-creator config add -n "my-project" -p github -o "username" -r "repo-name" -t "your-token"
```

### 2. Create an Issue

```bash
# Using saved configuration
issue-creator create -c "my-project" -t "Bug: Login not working" -d "Users cannot login with valid credentials"

# Direct API call
issue-creator create -o "username" -r "repo" --platform github --token "your-token" -t "Feature Request" -d "Add dark mode support" -l "enhancement,ui"
```

### 3. List Issues

```bash
# List open issues using saved config
issue-creator list -c "my-project"

# List all issues with specific parameters
issue-creator list -o "username" -r "repo" --platform gitee --token "your-token" -s all
```

## Commands

### Configuration Management

```bash
# Add new configuration
issue-creator config add [options]
issue-creator config a [options]  # alias

# List all saved configurations
issue-creator config list
issue-creator config l  # alias

# Remove a configuration
issue-creator config remove <name>
issue-creator config r <name>  # alias
```

### Issue Management

#### Create Issues

```bash
issue-creator create [options]
issue-creator cr [options]  # alias

Options:
  -c, --config <name>           Use saved configuration
  -o, --owner <owner>           Repository owner
  -r, --repo <repo>             Repository name
  -t, --title <title>           Issue title (required)
  -d, --description <desc>      Issue description
  -l, --labels <labels>         Comma-separated labels
  --platform <platform>        Platform (github or gitee)
  --token <token>              API token
```

#### Update Issues

```bash
issue-creator update [options]
issue-creator u [options]  # alias

Options:
  -c, --config <name>           Use saved configuration
  -o, --owner <owner>           Repository owner
  -r, --repo <repo>             Repository name
  -n, --number <number>         Issue number (required)
  -t, --title <title>           New issue title
  -d, --description <desc>      New issue description
  -s, --state <state>           Issue state (open|progressing|closed)
  -l, --labels <labels>         Comma-separated labels
  --platform <platform>        Platform (github or gitee)
  --token <token>              API token
```

#### List Issues

```bash
issue-creator list [options]
issue-creator l [options]  # alias

Options:
  -c, --config <name>           Use saved configuration
  -o, --owner <owner>           Repository owner
  -r, --repo <repo>             Repository name
  -s, --state <state>           Filter by state (open|closed|all, default: open)
  --platform <platform>        Platform (github or gitee)
  --token <token>              API token
```

## API Token Setup

### GitHub
1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Create a new token with `repo` scope
3. Copy the token for use with the CLI

### Gitee
1. Go to Gitee Settings → Private Tokens
2. Create a new token with appropriate permissions
3. Copy the token for use with the CLI

## Security

- All credentials are encrypted using SQLCipher before storage
- Database files are stored in `~/.issue-creator/` with restricted permissions
- Encryption keys are generated automatically and stored securely
- No credentials are logged or exposed in command output

## Examples

```bash
# Complete workflow example
issue-creator config add -n "main-project" -p github -o "myusername" -r "my-repo" -t "ghp_xxxxxxxxxxxx"

issue-creator create -c "main-project" -t "Add user authentication" -d "Implement OAuth login system" -l "feature,auth"

issue-creator list -c "main-project" -s all

issue-creator update -c "main-project" -n 1 -s "progressing" -l "feature,auth,in-progress"
```

## Troubleshooting

### Database Issues
```bash
# If you encounter database errors, try removing the config directory
rm -rf ~/.issue-creator/
# Then reconfigure your repositories
```

### Token Issues
- Ensure your tokens have the correct permissions
- For GitHub: `repo` scope is required
- For Gitee: Ensure the token has issue management permissions

### Autocompletion Not Working
```bash
# Reload your shell configuration
source ~/.bashrc
# Or restart your terminal
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
