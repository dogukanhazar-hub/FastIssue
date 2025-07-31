const Database = require('better-sqlite3');
const crypto = require('crypto');
const path = require('path');
const os = require('os');
const fs = require('fs');

class SecureDatabase {
  constructor() {
    this.ensureDirectoryExists();
    this.dbPath = path.join(os.homedir(), '.issue-creator', 'database.db');
    this.keyPath = path.join(os.homedir(), '.issue-creator', 'encryption.key');
    this.encryptionKey = this.getOrCreateEncryptionKey();
    this.db = new Database(this.dbPath);
    this.initTables();
  }

  ensureDirectoryExists() {
    const dir = path.join(os.homedir(), '.issue-creator');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
    }
  }

  initTables() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS repositories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        platform TEXT NOT NULL,
        owner TEXT NOT NULL,
        repo TEXT NOT NULL,
        token TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  getOrCreateEncryptionKey() {
    if (fs.existsSync(this.keyPath)) {
      return Buffer.from(fs.readFileSync(this.keyPath, 'utf8').trim(), 'hex');
    }
    
    const key = crypto.randomBytes(32);
    fs.writeFileSync(this.keyPath, key.toString('hex'), { mode: 0o600 });
    return key;
  }

  encrypt(text) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', this.encryptionKey, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  decrypt(text) {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = textParts.join(':');
    const decipher = crypto.createDecipheriv('aes-256-cbc', this.encryptionKey, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  saveRepository(name, platform, owner, repo, token) {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO repositories (name, platform, owner, repo, token)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const encryptedToken = this.encrypt(token);
    const result = stmt.run(name, platform, owner, repo, encryptedToken);
    return result.lastInsertRowid;
  }

  getRepository(name) {
    const stmt = this.db.prepare('SELECT * FROM repositories WHERE name = ?');
    const row = stmt.get(name);
    
    if (!row) return null;
    
    return {
      id: row.id,
      name: row.name,
      platform: row.platform,
      owner: row.owner,
      repo: row.repo,
      token: this.decrypt(row.token),
      created_at: row.created_at
    };
  }

  getAllRepositories() {
    const stmt = this.db.prepare('SELECT id, name, platform, owner, repo, created_at FROM repositories ORDER BY created_at DESC');
    return stmt.all();
  }

  deleteRepository(name) {
    const stmt = this.db.prepare('DELETE FROM repositories WHERE name = ?');
    const result = stmt.run(name);
    return result.changes;
  }

  close() {
    if (this.db) {
      this.db.close();
    }
  }
}

module.exports = SecureDatabase;