const BASE_URL = 'https://gene2.ai/api/v1';

/**
 * Gene2.ai API client.
 * Each API key is bound to a specific health profile (e.g. Self/Mom/Dad).
 */
export class Gene2aiClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  async request(path, options = {}) {
    const url = `${BASE_URL}${path}`;
    const res = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        ...options.headers,
      },
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const code = body.error || body.code || `HTTP ${res.status}`;
      const messages = {
        missing_token: '未配置 Gene2AI API Key，请在个人中心绑定。',
        invalid_token: 'Gene2AI API Key 无效，请检查后重新绑定。',
        token_expired: 'Gene2AI API Key 已过期（30天有效），请前往 gene2.ai/api-keys 重新生成。',
        key_revoked: 'Gene2AI API Key 已被撤销，请前往 gene2.ai/api-keys 重新生成。',
      };
      throw new Error(messages[code] || `Gene2AI 请求失败: ${code}`);
    }

    return res.json();
  }

  /** Tier 1: Compact conclusions-only profile (~2-4KB), cacheable */
  async getProfile() {
    return this.request('/health-data/profile');
  }

  /** Full records with optional filtering */
  async getFullRecords({ category, subcategory, format } = {}) {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (subcategory) params.set('subcategory', subcategory);
    if (format) params.set('format', format);
    const qs = params.toString();
    return this.request(`/health-data/full${qs ? `?${qs}` : ''}`);
  }

  /** Risk overview: genomic + lab cross-references */
  async getRiskOverview() {
    return this.request('/health-data/risk-overview');
  }

  /** Genomic links for a specific lab indicator */
  async getGenomicLinks(indicatorCode) {
    return this.request(`/health-data/genomic-links/${encodeURIComponent(indicatorCode)}`);
  }

  /** Lab-genomic summary for dashboard */
  async getLabGenomicSummary() {
    return this.request('/health-data/lab-genomic-summary');
  }

  /** Submit self-reported health records */
  async submitRecords(payload) {
    return this.request('/health-data/records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        source: 'rare2ai',
      }),
    });
  }

  /** Upload medical document (lab report, imaging, etc.) */
  async uploadDocument(file, { category, documentDate, title }) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('source', 'rare2ai');
    formData.append('category', category);
    if (documentDate) formData.append('documentDate', documentDate);
    if (title) formData.append('title', title);

    return this.request('/health-data/upload', {
      method: 'POST',
      body: formData,
    });
  }

  /** Check document parsing status */
  async getDocumentStatus(docId) {
    return this.request(`/health-data/doc/${encodeURIComponent(docId)}`);
  }
}
