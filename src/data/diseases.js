// 模拟数据库 - 病种分类数据

const diseases = [
  { id: 1, name: '渐冻症 (ALS)', category: '神经系统疾病', members: 128, posts: 342, description: '肌萎缩侧索硬化症，一种渐进性神经退行性疾病。' },
  { id: 2, name: '脊髓性肌萎缩症 (SMA)', category: '神经系统疾病', members: 96, posts: 218, description: '由SMN1基因缺陷导致的常染色体隐性遗传病。' },
  { id: 3, name: '戈谢病', category: '代谢性疾病', members: 64, posts: 156, description: '一种溶酶体贮积症，由葡萄糖脑苷脂酶缺乏引起。' },
  { id: 4, name: '苯丙酮尿症 (PKU)', category: '代谢性疾病', members: 85, posts: 198, description: '由苯丙氨酸羟化酶缺陷导致的氨基酸代谢障碍。' },
  { id: 5, name: '血友病', category: '血液系统疾病', members: 112, posts: 287, description: '一组因凝血因子缺乏导致的遗传性出血性疾病。' },
  { id: 6, name: '白化病', category: '其他', members: 43, posts: 98, description: '由黑色素合成障碍导致的遗传性皮肤病。' },
  { id: 7, name: '亨廷顿舞蹈症', category: '神经系统疾病', members: 54, posts: 127, description: '一种常染色体显性遗传的神经退行性疾病。' },
  { id: 8, name: '多发性硬化症', category: '神经系统疾病', members: 87, posts: 265, description: '一种中枢神经系统脱髓鞘自身免疫性疾病。' },
  { id: 9, name: '法布里病', category: '代谢性疾病', members: 38, posts: 89, description: 'α-半乳糖苷酶A缺乏导致的X连锁溶酶体贮积症。' },
  { id: 10, name: '庞贝病', category: '代谢性疾病', members: 42, posts: 103, description: '酸性α-葡萄糖苷酶缺乏导致的糖原贮积症。' },
  { id: 11, name: '地中海贫血', category: '血液系统疾病', members: 156, posts: 412, description: '一组由珠蛋白基因缺陷导致的遗传性溶血性贫血。' },
  { id: 12, name: '阵发性睡眠性血红蛋白尿', category: '血液系统疾病', members: 29, posts: 67, description: '一种后天获得性造血干细胞克隆性疾病。' },
  { id: 13, name: '成骨不全症 (瓷娃娃)', category: '其他', members: 76, posts: 189, description: '由I型胶原基因突变导致的遗传性骨骼疾病。' },
  { id: 14, name: '马凡综合征', category: '其他', members: 61, posts: 134, description: '由纤维蛋白-1基因突变导致的结缔组织遗传病。' },
];

export function getAllDiseases() {
  return diseases;
}

export function getDiseaseById(id) {
  return diseases.find((d) => d.id === id) || null;
}

export function getDiseasesByCategory(category) {
  return diseases.filter((d) => d.category === category);
}

export function searchDiseases(query) {
  const q = query.toLowerCase();
  return diseases.filter(
    (d) => d.name.toLowerCase().includes(q) || d.description.toLowerCase().includes(q)
  );
}

export function getCategories() {
  const cats = [...new Set(diseases.map((d) => d.category))];
  return cats.map((cat) => ({
    name: cat,
    count: diseases.filter((d) => d.category === cat).length,
  }));
}
