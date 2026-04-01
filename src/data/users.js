// 模拟数据库 - 用户数据

import { createPasswordHash, verifyPassword } from '@/lib/auth';

let nextUserId = 10;

// 默认密码: "password123"（仅用于演示）
const defaultPwd = createPasswordHash('password123');

const users = [
  { id: 1, username: '希望之光', email: 'hope@example.com', password: defaultPwd.hash, salt: defaultPwd.salt, role: 'user', diseaseIds: [2], joinDate: '2025-06-15', bio: 'SMA患儿家长，记录治疗历程' },
  { id: 2, username: '守护者', email: 'guardian@example.com', password: defaultPwd.hash, salt: defaultPwd.salt, role: 'user', diseaseIds: [1], joinDate: '2025-04-20', bio: 'ALS患者家属，分享护理经验' },
  { id: 3, username: '同路人', email: 'together@example.com', password: defaultPwd.hash, salt: defaultPwd.salt, role: 'user', diseaseIds: [2], joinDate: '2025-08-10', bio: 'SMA家庭，一起加油' },
  { id: 4, username: '医学前沿', email: 'medfront@example.com', password: defaultPwd.hash, salt: defaultPwd.salt, role: 'expert', diseaseIds: [], joinDate: '2025-03-01', bio: '临床医学研究者，关注罕见病药物研发' },
  { id: 5, username: '营养师小王', email: 'nutrition@example.com', password: defaultPwd.hash, salt: defaultPwd.salt, role: 'expert', diseaseIds: [4], joinDate: '2025-07-22', bio: '注册营养师，专注PKU饮食管理' },
  { id: 6, username: '运动达人', email: 'sports@example.com', password: defaultPwd.hash, salt: defaultPwd.salt, role: 'user', diseaseIds: [5], joinDate: '2025-09-05', bio: '血友病患者，热爱运动' },
  { id: 7, username: '政策观察', email: 'policy@example.com', password: defaultPwd.hash, salt: defaultPwd.salt, role: 'admin', diseaseIds: [], joinDate: '2025-01-10', bio: '关注罕见病政策和医保动态' },
  { id: 8, username: '坚强妈妈', email: 'strongmom@example.com', password: defaultPwd.hash, salt: defaultPwd.salt, role: 'user', diseaseIds: [13], joinDate: '2025-05-18', bio: '成骨不全症患儿妈妈' },
  { id: 9, username: '心理咨询师', email: 'counselor@example.com', password: defaultPwd.hash, salt: defaultPwd.salt, role: 'expert', diseaseIds: [], joinDate: '2025-02-28', bio: '国家二级心理咨询师，志愿服务罕见病群体' },
];

// 返回用户公开信息（去除密码等敏感字段）
function toPublic(user) {
  if (!user) return null;
  const { password, salt, ...pub } = user;
  return pub;
}

export function getAllUsers({ page = 1, limit = 10, role } = {}) {
  let filtered = [...users];
  if (role) {
    filtered = filtered.filter((u) => u.role === role);
  }
  const total = filtered.length;
  const start = (page - 1) * limit;
  const items = filtered.slice(start, start + limit).map(toPublic);
  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export function getUserById(id) {
  return toPublic(users.find((u) => u.id === id));
}

export function getUserByUsername(username) {
  return toPublic(users.find((u) => u.username === username));
}

export function getUserByEmail(email) {
  return users.find((u) => u.email === email) || null;
}

// 验证用户密码，返回原始用户对象（含密码），用于登录
export function authenticateUser(email, password) {
  const user = users.find((u) => u.email === email);
  if (!user) return null;
  if (!verifyPassword(password, user.salt, user.password)) return null;
  return user;
}

export function createUser({ username, email, password, role = 'user', diseaseIds = [], bio = '' }) {
  if (users.find((u) => u.email === email)) {
    return { error: '邮箱已注册' };
  }
  if (users.find((u) => u.username === username)) {
    return { error: '用户名已存在' };
  }
  const pwd = createPasswordHash(password);
  const user = {
    id: nextUserId++,
    username,
    email,
    password: pwd.hash,
    salt: pwd.salt,
    role,
    diseaseIds,
    joinDate: new Date().toISOString().split('T')[0],
    bio,
  };
  users.push(user);
  return toPublic(user);
}

export function updateUser(id, updates) {
  const user = users.find((u) => u.id === id);
  if (!user) return null;
  const allowed = ['username', 'bio', 'diseaseIds'];
  for (const key of allowed) {
    if (updates[key] !== undefined) {
      user[key] = updates[key];
    }
  }
  return toPublic(user);
}
