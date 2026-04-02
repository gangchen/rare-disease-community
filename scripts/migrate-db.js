const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '..', 'data', 'community.db');

if (!fs.existsSync(DB_PATH)) {
  console.log('数据库不存在，请先运行 node scripts/init-db.js');
  process.exit(1);
}

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// 获取已有的表
const existingTables = db.prepare(
  "SELECT name FROM sqlite_master WHERE type='table'"
).all().map(r => r.name);

console.log('现有表:', existingTables.join(', '));

let migrated = 0;

// --- likes 表 ---
if (!existingTables.includes('likes')) {
  db.exec(`
    CREATE TABLE likes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      UNIQUE(post_id, user_id),
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE INDEX idx_likes_post ON likes(post_id);
  `);
  console.log('✓ 创建 likes 表');
  migrated++;
}

// --- news 表 ---
if (!existingTables.includes('news')) {
  db.exec(`
    CREATE TABLE news (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      summary TEXT DEFAULT '',
      content TEXT NOT NULL,
      category TEXT NOT NULL,
      image_url TEXT DEFAULT '',
      author_id INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE INDEX idx_news_created ON news(created_at DESC);
    CREATE INDEX idx_news_category ON news(category);
  `);
  console.log('✓ 创建 news 表');

  // 插入初始新闻数据
  const newsData = [
    ['ALS基因疗法进入临床试验', '一项针对渐冻症的新型基因疗法已获批进入III期临床试验。', '近日，某知名制药公司宣布，其针对SOD1突变型ALS的反义寡核苷酸疗法已成功完成II期临床试验，显示出显著的疗效。III期试验预计将在全球多个中心招募500名患者参与。', 'research', '', 4, '2026-03-28'],
    ['孤儿药加速审批新政策实施', '国家药监局发布新政，罕见病用药审批周期将缩短至6个月。', '为进一步加速罕见病用药可及性，国家药品监督管理局近日正式实施《罕见病药物优先审评审批工作程序》，明确罕见病用药可享受优先审评审批通道。', 'policy', '', 7, '2026-03-26'],
    ['法布里病酶替代疗法长期数据公布', '一项跟踪10年的研究显示，法布里病酶替代疗法可显著改善患者心脏和肾脏功能。', '发表在《新英格兰医学杂志》的研究纳入了来自全球15个中心的320名法布里病患者，持续接受酶替代疗法的患者左心室质量指数年均下降2.3%。', 'research', '', 4, '2026-03-24'],
    ['罕见病心理支持指南发布', '中国罕见病联盟联合多家机构发布首部《罕见病患者心理健康支持指南》。', '该指南涵盖了确诊期心理危机干预、长期治疗中的心理调适、照护者心理支持等六个板块。', 'patient_story', '', 9, '2026-03-22'],
    ['SMA基因治疗药物纳入医保目录', '诺西那生钠注射液正式纳入国家医保目录，患者自付费用大幅降低。', '纳入医保后患者自付比例降至约3万元/针，惠及全国约3万名SMA患者。', 'policy', '', 7, '2026-03-20'],
    ['戈谢病新型口服药物获批上市', '全球首个口服底物减少疗法药物获批上市，为戈谢病I型患者提供便捷治疗选择。', '口服给药大幅提高了患者的依从性和生活质量。', 'drug_approval', '', 4, '2026-03-18'],
  ];

  const insert = db.prepare(
    'INSERT INTO news (title, summary, content, category, image_url, author_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );
  for (const n of newsData) {
    insert.run(...n);
  }
  console.log(`  插入 ${newsData.length} 条初始新闻`);
  migrated++;
}

// --- tokens 表 ---
if (!existingTables.includes('tokens')) {
  db.exec(`
    CREATE TABLE tokens (
      token TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      role TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      expires_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE INDEX idx_tokens_expires ON tokens(expires_at);
  `);
  console.log('✓ 创建 tokens 表');
  migrated++;
}

// --- api_keys 表 ---
if (!existingTables.includes('api_keys')) {
  db.exec(`
    CREATE TABLE api_keys (
      key TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      active INTEGER DEFAULT 1,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE INDEX idx_api_keys_user ON api_keys(user_id);
  `);
  console.log('✓ 创建 api_keys 表');
  migrated++;
}

// --- posts.category 列 ---
const postColumns = db.prepare("PRAGMA table_info(posts)").all().map(c => c.name);
if (!postColumns.includes('category')) {
  db.exec("ALTER TABLE posts ADD COLUMN category TEXT NOT NULL DEFAULT 'topic'");
  console.log('✓ 添加 posts.category 列');
  migrated++;
}

// --- notifications 表 ---
if (!existingTables.includes('notifications')) {
  db.exec(`
    CREATE TABLE notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      source_user_id INTEGER NOT NULL,
      post_id INTEGER NOT NULL,
      comment_id INTEGER,
      data TEXT DEFAULT '{}',
      is_read INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (source_user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
    );
    CREATE INDEX idx_notifications_user ON notifications(user_id, is_read, created_at DESC);
  `);
  console.log('✓ 创建 notifications 表');
  migrated++;
}

// --- api_logs 表 ---
if (!existingTables.includes('api_logs')) {
  db.exec(`
    CREATE TABLE api_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      method TEXT NOT NULL,
      path TEXT NOT NULL,
      endpoint TEXT NOT NULL,
      status INTEGER NOT NULL,
      response_time_ms INTEGER NOT NULL,
      api_key_id TEXT,
      user_id INTEGER,
      ip TEXT,
      error_message TEXT,
      created_at TEXT NOT NULL
    );
    CREATE INDEX idx_api_logs_created ON api_logs(created_at DESC);
    CREATE INDEX idx_api_logs_endpoint ON api_logs(endpoint, created_at);
    CREATE INDEX idx_api_logs_status ON api_logs(status);
    CREATE INDEX idx_api_logs_api_key ON api_logs(api_key_id);
  `);
  console.log('✓ 创建 api_logs 表');
  migrated++;
}

// --- api_stats_daily 表 ---
if (!existingTables.includes('api_stats_daily')) {
  db.exec(`
    CREATE TABLE api_stats_daily (
      date TEXT NOT NULL,
      endpoint TEXT NOT NULL,
      total_requests INTEGER DEFAULT 0,
      success_count INTEGER DEFAULT 0,
      error_count INTEGER DEFAULT 0,
      avg_response_ms INTEGER DEFAULT 0,
      PRIMARY KEY (date, endpoint)
    );
  `);
  console.log('✓ 创建 api_stats_daily 表');
  migrated++;
}

// --- 未来的迁移在这里追加 ---
// if (!existingTables.includes('xxx')) { ... }

db.close();

if (migrated === 0) {
  console.log('数据库已是最新，无需迁移');
} else {
  console.log(`\n迁移完成，新增 ${migrated} 张表（现有数据未受影响）`);
}
