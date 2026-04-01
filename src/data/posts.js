// 模拟数据库 - 帖子数据

let nextPostId = 9;
let nextCommentId = 4;

const posts = [
  { id: 1, title: '确诊SMA后的治疗经历分享', content: '我家孩子在8个月大时确诊SMA I型，经过多方咨询最终开始了诺西那生钠注射治疗。目前已经注射了4次，运动功能有了明显改善...', author: '希望之光', authorId: 1, diseaseId: 2, disease: '脊髓性肌萎缩症', date: '2026-03-30', replies: 23, views: 456, comments: [
    { id: 1, author: '同路人', authorId: 3, content: '感谢分享！我家宝宝也是SMA I型，想请问治疗费用大概多少？', date: '2026-03-30' },
    { id: 2, author: '医学前沿', authorId: 4, content: '诺西那生钠现在已经纳入医保了，负担会小很多。', date: '2026-03-31' },
  ]},
  { id: 2, title: '渐冻症患者家属互助指南', content: '作为一名ALS患者的家属，这三年来我积累了很多护理经验。从呼吸机的使用到日常饮食的调整，希望能帮到更多的家庭...', author: '守护者', authorId: 2, diseaseId: 1, disease: '渐冻症', date: '2026-03-29', replies: 45, views: 892, comments: [
    { id: 3, author: '希望之光', authorId: 1, content: '非常实用的指南，已收藏。', date: '2026-03-29' },
  ]},
  { id: 3, title: 'PKU饮食管理经验总结', content: '苯丙酮尿症最关键的就是饮食控制。经过5年的摸索，我总结了一套适合PKU患儿的食谱和饮食管理方法...', author: '营养师小王', authorId: 5, diseaseId: 4, disease: '苯丙酮尿症', date: '2026-03-28', replies: 18, views: 324, comments: [] },
  { id: 4, title: '戈谢病最新药物临床试验信息', content: '分享一下最近了解到的戈谢病临床试验信息。目前国内有几个正在进行的III期临床试验...', author: '医学前沿', authorId: 4, diseaseId: 3, disease: '戈谢病', date: '2026-03-27', replies: 31, views: 567, comments: [] },
  { id: 5, title: '血友病患者运动注意事项', content: '很多人觉得血友病患者不能运动，其实不是这样的。适当的运动对关节保护很有帮助，关键是选对运动类型...', author: '运动达人', authorId: 6, diseaseId: 5, disease: '血友病', date: '2026-03-26', replies: 15, views: 278, comments: [] },
  { id: 6, title: '罕见病用药报销政策解读', content: '2026年最新的医保政策对罕见病患者有了更多的倾斜，目前已有超过40种罕见病用药纳入医保目录...', author: '政策观察', authorId: 7, diseaseId: null, disease: '综合', date: '2026-03-25', replies: 67, views: 1230, comments: [] },
  { id: 7, title: '瓷娃娃康复训练分享', content: '成骨不全症患儿的康复训练需要非常小心，分享我们的物理治疗师给出的家庭康复方案...', author: '坚强妈妈', authorId: 8, diseaseId: 13, disease: '成骨不全症', date: '2026-03-24', replies: 28, views: 445, comments: [] },
  { id: 8, title: '如何面对确诊后的心理压力', content: '确诊罕见病后，无论是患者本人还是家属，心理上都会承受巨大的压力。作为心理咨询师，我想分享一些实用的心理调适方法...', author: '心理咨询师', authorId: 9, diseaseId: null, disease: '综合', date: '2026-03-23', replies: 52, views: 980, comments: [] },
];

export function getAllPosts({ page = 1, limit = 10, diseaseId, sort = 'date' } = {}) {
  let filtered = [...posts];
  if (diseaseId) {
    filtered = filtered.filter((p) => p.diseaseId === diseaseId);
  }
  if (sort === 'date') {
    filtered.sort((a, b) => b.date.localeCompare(a.date));
  } else if (sort === 'views') {
    filtered.sort((a, b) => b.views - a.views);
  } else if (sort === 'replies') {
    filtered.sort((a, b) => b.replies - a.replies);
  }
  const total = filtered.length;
  const start = (page - 1) * limit;
  const items = filtered.slice(start, start + limit);
  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export function getPostById(id) {
  return posts.find((p) => p.id === id) || null;
}

export function createPost({ title, content, author, authorId, diseaseId, disease }) {
  const post = {
    id: nextPostId++,
    title,
    content,
    author,
    authorId,
    diseaseId: diseaseId || null,
    disease: disease || '综合',
    date: new Date().toISOString().split('T')[0],
    replies: 0,
    views: 0,
    comments: [],
  };
  posts.unshift(post);
  return post;
}

export function addComment(postId, { author, authorId, content }) {
  const post = posts.find((p) => p.id === postId);
  if (!post) return null;
  const comment = {
    id: nextCommentId++,
    author,
    authorId,
    content,
    date: new Date().toISOString().split('T')[0],
  };
  post.comments.push(comment);
  post.replies += 1;
  return comment;
}

export function searchPosts(query) {
  const q = query.toLowerCase();
  return posts.filter(
    (p) => p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q)
  );
}
