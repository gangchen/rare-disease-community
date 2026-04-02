const ROLE_CONFIG = {
  admin: { label: '管理员', className: 'bg-red-500/15 text-red-400 border-red-500/20' },
  expert: { label: '专家', className: 'bg-sky-500/15 text-sky-400 border-sky-500/20' },
};

export default function RoleBadge({ role }) {
  const config = ROLE_CONFIG[role];
  if (!config) return null;
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold rounded border ${config.className}`}>
      {config.label}
    </span>
  );
}
