export function MenuBar() {
  return (
    <div className="h-7 bg-surface-925 border-b border-surface-850 flex items-center px-3 select-none shrink-0 drag-region">
      <div className="flex items-center gap-2 no-drag">
        <img src="/codi-logo.svg" alt="Codi" className="w-4 h-4" />
        <span className="text-[11px] font-medium text-surface-300">Codi</span>
      </div>
      <div className="flex-1 drag-region" />
    </div>
  );
}
