const Database = require('better-sqlite3');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DATA_DIR, 'community.db');

// 确保 data 目录存在
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// 如果数据库已存在，先删除重建
if (fs.existsSync(DB_PATH)) {
  fs.unlinkSync(DB_PATH);
  console.log('已删除旧数据库');
}

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ========== 建表 ==========

db.exec(`
  CREATE TABLE diseases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    members INTEGER DEFAULT 0,
    posts_count INTEGER DEFAULT 0,
    description TEXT DEFAULT ''
  );

  CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    salt TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    join_date TEXT NOT NULL,
    bio TEXT DEFAULT ''
  );

  CREATE TABLE user_diseases (
    user_id INTEGER NOT NULL,
    disease_id INTEGER NOT NULL,
    PRIMARY KEY (user_id, disease_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (disease_id) REFERENCES diseases(id) ON DELETE CASCADE
  );

  CREATE TABLE posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author_id INTEGER NOT NULL,
    disease_id INTEGER,
    created_at TEXT NOT NULL,
    views INTEGER DEFAULT 0,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (disease_id) REFERENCES diseases(id) ON DELETE SET NULL
  );

  CREATE TABLE comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    author_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE tokens (
    token TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    role TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    expires_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE api_keys (
    key TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    active INTEGER DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX idx_posts_disease ON posts(disease_id);
  CREATE INDEX idx_posts_author ON posts(author_id);
  CREATE INDEX idx_posts_created ON posts(created_at DESC);
  CREATE INDEX idx_comments_post ON comments(post_id);
  CREATE INDEX idx_tokens_expires ON tokens(expires_at);
  CREATE INDEX idx_api_keys_user ON api_keys(user_id);
`);

console.log('数据库表创建完成');

// ========== 密码工具 ==========

function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

function createPasswordHash(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = hashPassword(password, salt);
  return { salt, hash };
}

// ========== 插入种子数据 ==========

// 病种数据
const diseases = [
  ['渐冻症 (ALS)', '神经系统疾病', 128, 342, '肌萎缩侧索硬化症，一种渐进性神经退行性疾病。'],
  ['脊髓性肌萎缩症 (SMA)', '神经系统疾病', 96, 218, '由SMN1基因缺陷导致的常染色体隐性遗传病。'],
  ['戈谢病', '代谢性疾病', 64, 156, '一种溶酶体贮积症，由葡萄糖脑苷脂酶缺乏引起。'],
  ['苯丙酮尿症 (PKU)', '代谢性疾病', 85, 198, '由苯丙氨酸羟化酶缺陷导致的氨基酸代谢障碍。'],
  ['血友病', '血液系统疾病', 112, 287, '一组因凝血因子缺乏导致的遗传性出血性疾病。'],
  ['白化病', '其他', 43, 98, '由黑色素合成障碍导致的遗传性皮肤病。'],
  ['亨廷顿舞蹈症', '神经系统疾病', 54, 127, '一种常染色体显性遗传的神经退行性疾病。'],
  ['多发性硬化症', '神经系统疾病', 87, 265, '一种中枢神经系统脱髓鞘自身免疫性疾病。'],
  ['法布里病', '代谢性疾病', 38, 89, 'α-半乳糖苷酶A缺乏导致的X连锁溶酶体贮积症。'],
  ['庞贝病', '代谢性疾病', 42, 103, '酸性α-葡萄糖苷酶缺乏导致的糖原贮积症。'],
  ['地中海贫血', '血液系统疾病', 156, 412, '一组由珠蛋白基因缺陷导致的遗传性溶血性贫血。'],
  ['阵发性睡眠性血红蛋白尿', '血液系统疾病', 29, 67, '一种后天获得性造血干细胞克隆性疾病。'],
  ['成骨不全症 (瓷娃娃)', '其他', 76, 189, '由I型胶原基因突变导致的遗传性骨骼疾病。'],
  ['马凡综合征', '其他', 61, 134, '由纤维蛋白-1基因突变导致的结缔组织遗传病。'],
];

const insertDisease = db.prepare(
  'INSERT INTO diseases (name, category, members, posts_count, description) VALUES (?, ?, ?, ?, ?)'
);
for (const d of diseases) {
  insertDisease.run(...d);
}
console.log(`插入 ${diseases.length} 条病种数据`);

// 用户数据（默认密码: password123）
const pwd = createPasswordHash('password123');

const usersData = [
  ['希望之光', 'hope@example.com', 'user', '2025-06-15', 'SMA患儿家长，记录治疗历程', [2]],
  ['守护者', 'guardian@example.com', 'user', '2025-04-20', 'ALS患者家属，分享护理经验', [1]],
  ['同路人', 'together@example.com', 'user', '2025-08-10', 'SMA家庭，一起加油', [2]],
  ['医学前沿', 'medfront@example.com', 'expert', '2025-03-01', '临床医学研究者，关注罕见病药物研发', []],
  ['营养师小王', 'nutrition@example.com', 'expert', '2025-07-22', '注册营养师，专注PKU饮食管理', [4]],
  ['运动达人', 'sports@example.com', 'user', '2025-09-05', '血友病患者，热爱运动', [5]],
  ['政策观察', 'policy@example.com', 'admin', '2025-01-10', '关注罕见病政策和医保动态', []],
  ['坚强妈妈', 'strongmom@example.com', 'user', '2025-05-18', '成骨不全症患儿妈妈', [13]],
  ['心理咨询师', 'counselor@example.com', 'expert', '2025-02-28', '国家二级心理咨询师，志愿服务罕见病群体', []],
];

const insertUser = db.prepare(
  'INSERT INTO users (username, email, password, salt, role, join_date, bio) VALUES (?, ?, ?, ?, ?, ?, ?)'
);
const insertUserDisease = db.prepare(
  'INSERT INTO user_diseases (user_id, disease_id) VALUES (?, ?)'
);

for (const [username, email, role, joinDate, bio, diseaseIds] of usersData) {
  const result = insertUser.run(username, email, pwd.hash, pwd.salt, role, joinDate, bio);
  for (const did of diseaseIds) {
    insertUserDisease.run(result.lastInsertRowid, did);
  }
}
console.log(`插入 ${usersData.length} 条用户数据`);

// 帖子数据
const postsData = [
  ['确诊SMA后的治疗经历分享', '我家孩子在8个月大时确诊SMA I型，经过多方咨询最终开始了诺西那生钠注射治疗。目前已经注射了4次，运动功能有了明显改善...', 1, 2, '2026-03-30', 456],
  ['渐冻症患者家属互助指南', '作为一名ALS患者的家属，这三年来我积累了很多护理经验。从呼吸机的使用到日常饮食的调整，希望能帮到更多的家庭...', 2, 1, '2026-03-29', 892],
  ['PKU饮食管理经验总结', '苯丙酮尿症最关键的就是饮食控制。经过5年的摸索，我总结了一套适合PKU患儿的食谱和饮食管理方法...', 5, 4, '2026-03-28', 324],
  ['戈谢病最新药物临床试验信息', '分享一下最近了解到的戈谢病临床试验信息。目前国内有几个正在进行的III期临床试验...', 4, 3, '2026-03-27', 567],
  ['血友病患者运动注意事项', '很多人觉得血友病患者不能运动，其实不是这样的。适当的运动对关节保护很有帮助，关键是选对运动类型...', 6, 5, '2026-03-26', 278],
  ['罕见病用药报销政策解读', '2026年最新的医保政策对罕见病患者有了更多的倾斜，目前已有超过40种罕见病用药纳入医保目录...', 7, null, '2026-03-25', 1230],
  ['瓷娃娃康复训练分享', '成骨不全症患儿的康复训练需要非常小心，分享我们的物理治疗师给出的家庭康复方案...', 8, 13, '2026-03-24', 445],
  ['如何面对确诊后的心理压力', '确诊罕见病后，无论是患者本人还是家属，心理上都会承受巨大的压力。作为心理咨询师，我想分享一些实用的心理调适方法...', 9, null, '2026-03-23', 980],
];

const insertPost = db.prepare(
  'INSERT INTO posts (title, content, author_id, disease_id, created_at, views) VALUES (?, ?, ?, ?, ?, ?)'
);
for (const p of postsData) {
  insertPost.run(...p);
}
console.log(`插入 ${postsData.length} 条帖子数据`);

// 评论数据
const commentsData = [
  [1, 3, '感谢分享！我家宝宝也是SMA I型，想请问治疗费用大概多少？', '2026-03-30'],
  [1, 4, '诺西那生钠现在已经纳入医保了，负担会小很多。', '2026-03-31'],
  [2, 1, '非常实用的指南，已收藏。', '2026-03-29'],
];

const insertComment = db.prepare(
  'INSERT INTO comments (post_id, author_id, content, created_at) VALUES (?, ?, ?, ?)'
);
for (const c of commentsData) {
  insertComment.run(...c);
}
console.log(`插入 ${commentsData.length} 条评论数据`);

db.close();
console.log('\n数据库初始化完成！文件位置:', DB_PATH);
