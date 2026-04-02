function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export default function SafeContent({ text, className = '' }) {
  return (
    <div
      className={`whitespace-pre-wrap ${className}`}
      dangerouslySetInnerHTML={{ __html: escapeHtml(text || '') }}
    />
  );
}
