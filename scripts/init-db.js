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
    bio TEXT DEFAULT '',
    gene2ai_key TEXT
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
    category TEXT NOT NULL DEFAULT 'topic',
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

  CREATE TABLE likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    UNIQUE(post_id, user_id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

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
  CREATE INDEX idx_likes_post ON likes(post_id);
  CREATE INDEX idx_news_created ON news(created_at DESC);
  CREATE INDEX idx_news_category ON news(category);
  CREATE INDEX idx_tokens_expires ON tokens(expires_at);
  CREATE INDEX idx_api_keys_user ON api_keys(user_id);

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

  CREATE TABLE api_stats_daily (
    date TEXT NOT NULL,
    endpoint TEXT NOT NULL,
    total_requests INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    avg_response_ms INTEGER DEFAULT 0,
    PRIMARY KEY (date, endpoint)
  );

  CREATE TABLE chat_sessions (
    id TEXT PRIMARY KEY,
    user_id INTEGER,
    title TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
  );

  CREATE TABLE chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    tool_calls TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
  );

  CREATE INDEX idx_chat_msg_session ON chat_messages(session_id, created_at);
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
  ['确诊SMA后的治疗经历分享', '我家孩子在8个月大时确诊SMA I型，经过多方咨询最终开始了诺西那生钠注射治疗。目前已经注射了4次，运动功能有了明显改善...', 1, 2, 'experience', '2026-03-30', 456],
  ['渐冻症患者家属互助指南', '作为一名ALS患者的家属，这三年来我积累了很多护理经验。从呼吸机的使用到日常饮食的调整，希望能帮到更多的家庭...', 2, 1, 'experience', '2026-03-29', 892],
  ['PKU饮食管理经验总结', '苯丙酮尿症最关键的就是饮食控制。经过5年的摸索，我总结了一套适合PKU患儿的食谱和饮食管理方法...', 5, 4, 'experience', '2026-03-28', 324],
  ['戈谢病最新药物临床试验信息', '分享一下最近了解到的戈谢病临床试验信息。目前国内有几个正在进行的III期临床试验...', 4, 3, 'topic', '2026-03-27', 567],
  ['血友病患者运动注意事项', '很多人觉得血友病患者不能运动，其实不是这样的。适当的运动对关节保护很有帮助，关键是选对运动类型...', 6, 5, 'experience', '2026-03-26', 278],
  ['罕见病用药报销政策解读', '2026年最新的医保政策对罕见病患者有了更多的倾斜，目前已有超过40种罕见病用药纳入医保目录...', 7, null, 'topic', '2026-03-25', 1230],
  ['瓷娃娃康复训练分享', '成骨不全症患儿的康复训练需要非常小心，分享我们的物理治疗师给出的家庭康复方案...', 8, 13, 'experience', '2026-03-24', 445],
  ['如何面对确诊后的心理压力', '确诊罕见病后，无论是患者本人还是家属，心理上都会承受巨大的压力。作为心理咨询师，我想分享一些实用的心理调适方法...', 9, null, 'question', '2026-03-23', 980],
];

const insertPost = db.prepare(
  'INSERT INTO posts (title, content, author_id, disease_id, category, created_at, views) VALUES (?, ?, ?, ?, ?, ?, ?)'
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

// 点赞数据
const likesData = [
  [1, 2], [1, 3], [1, 4], [1, 6], [1, 8],
  [2, 1], [2, 3], [2, 5], [2, 7], [2, 8], [2, 9],
  [3, 1], [3, 6],
  [4, 1], [4, 2], [4, 5],
  [5, 1], [5, 2],
  [6, 1], [6, 2], [6, 3], [6, 4], [6, 5], [6, 8], [6, 9],
  [7, 1], [7, 3], [7, 9],
  [8, 1], [8, 2], [8, 3], [8, 5], [8, 6], [8, 7], [8, 8],
];

const insertLike = db.prepare(
  'INSERT INTO likes (post_id, user_id, created_at) VALUES (?, ?, ?)'
);
for (const [postId, userId] of likesData) {
  insertLike.run(postId, userId, '2026-03-30');
}
console.log(`插入 ${likesData.length} 条点赞数据`);

// 新闻数据
const newsData = [
  ['ALS基因疗法进入临床试验', '一项针对渐冻症(ALS)的新型基因疗法已获批进入III期临床试验，有望为患者带来新的治疗选择。', '近日，某知名制药公司宣布，其针对SOD1突变型ALS的反义寡核苷酸(ASO)疗法已成功完成II期临床试验，显示出显著的疾效果。该疗法通过靶向SOD1 mRNA，减少有毒蛋白质的产生，从而延缓疾病进展。III期试验预计将在全球多个中心招募500名患者参与。', 'research', '', 4, '2026-03-28'],
  ['孤儿药加速审批新政策实施', '国家药监局发布新政，罕见病用药审批周期将缩短至6个月，多项措施助力孤儿药研发。', '为进一步加速罕见病用药可及性，国家药品监督管理局近日正式实施《罕见病药物优先审评审批工作程序》，明确罕见病用药可享受优先审评审批通道，审批周期从原来的12-18个月缩短至6个月。同时还出台了临床试验数据豁免、境外数据接受等配套政策。', 'policy', '', 7, '2026-03-26'],
  ['法布里病酶替代疗法长期数据公布', '一项跟踪10年的研究显示，法布里病酶替代疗法可显著改善患者心脏和肾脏功能。', '发表在《新英格兰医学杂志》的一项为期10年的前瞻性队列研究，纳入了来自全球15个中心的320名法布里病患者。研究结果表明，持续接受酶替代疗法的患者，其左心室质量指数年均下降2.3%，eGFR稳定率达到78%。', 'research', '', 4, '2026-03-24'],
  ['罕见病心理支持指南发布', '中国罕见病联盟联合多家机构发布首部《罕见病患者心理健康支持指南》。', '该指南由中国罕见病联盟牵头，联合北京大学第一医院、协和医院等10余家机构的心理学专家共同编写。指南涵盖了确诊期心理危机干预、长期治疗中的心理调适、照护者心理支持等六个板块。', 'patient_story', '', 9, '2026-03-22'],
  ['SMA基因治疗药物纳入医保目录', '诺西那生钠注射液正式纳入国家医保目录，患者自付费用大幅降低。', '经过多轮谈判，SMA基因治疗药物诺西那生钠注射液已正式纳入2026年国家医保药品目录。此前每针约70万元的费用，在纳入医保后患者自付比例降至约3万元/针。这一政策惠及全国约3万名SMA患者。', 'policy', '', 7, '2026-03-20'],
  ['戈谢病新型口服药物获批上市', '全球首个口服底物减少疗法药物获批上市，为戈谢病I型患者提供便捷治疗选择。', '某国际制药公司宣布，其开发的新型口服底物减少疗法(SRT)药物已在中国获批上市，用于治疗戈谢病I型成人患者。相比传统的静脉注射酶替代疗法，口服给药大幅提高了患者的依从性和生活质量。', 'drug_approval', '', 4, '2026-03-18'],
  ['罕见病患者互助社区助力千名家庭', '线上互助社区成立一年，已帮助超过1000个罕见病家庭建立联系和获取信息支持。', '自平台成立以来，已有来自全国各地超过1000个罕见病家庭通过平台建立了联系。社区覆盖50余种罕见病，活跃志愿者超200人，举办线上分享会30余场。多位患者表示，社区的支持让他们不再感到孤单。', 'patient_story', '', 7, '2026-03-15'],
  ['血友病预防性治疗新进展', '长效凝血因子产品研发取得突破，有望将血友病患者的注射频率降至每月一次。', '最新发表的临床研究数据显示，一种基于Fc融合技术的长效FIX凝血因子产品，在血友病B型患者中实现了每月一次的预防性给药方案。该方案不仅降低了年出血率，还显著提高了患者的治疗依从性。', 'research', '', 4, '2026-03-12'],
];

const insertNews = db.prepare(
  'INSERT INTO news (title, summary, content, category, image_url, author_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
);
for (const n of newsData) {
  insertNews.run(...n);
}
console.log(`插入 ${newsData.length} 条新闻数据`);

db.close();
console.log('\n数据库初始化完成！文件位置:', DB_PATH);
