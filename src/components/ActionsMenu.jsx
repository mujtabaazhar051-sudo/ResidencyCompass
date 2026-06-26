import { useEffect, useRef, useState } from 'react'

function MenuItem({ onClick, children, className = '', disabled = false }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  )
}

function MenuDivider() {
  return <div className="my-1 border-t border-slate-200 dark:border-slate-700" />
}

export default function ActionsMenu({
  programCount,
  isImported,
  shortlistCount,
  myListCount = 0,
  onImport,
  onReset,
  onExportCSV,
  onExportShortlist,
  onExportMyList,
  onBackup,
  onRestore,
  onPrint,
  onClearData,
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)

  useEffect(() => {
    if (!open) return
    function handleClick(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false)
    }
    function handleKey(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  function run(action) {
    setOpen(false)
    action()
  }

  return (
    <div ref={rootRef} className="relative no-print">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-slate-500 dark:text-slate-400">
          {programCount} program{programCount !== 1 ? 's' : ''} loaded
          {isImported && (
            <span className="ml-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
              imported
            </span>
          )}
        </span>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-haspopup="menu"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          Actions
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className={`h-4 w-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
          >
            <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-1.5 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800"
        >
          <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            Data
          </div>
          <MenuItem
            onClick={() => run(onImport)}
            className="text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-700/80"
          >
            ↑ Import from CSV / Sheets
          </MenuItem>
          {isImported && (
            <MenuItem
              onClick={() => run(onReset)}
              className="text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-700/80"
            >
              Reset to default program list
            </MenuItem>
          )}

          <MenuItem
            onClick={() => run(onBackup)}
            className="text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-700/80"
          >
            Download backup (.json)
          </MenuItem>
          <MenuItem
            onClick={() => run(onRestore)}
            className="text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-700/80"
          >
            Restore from backup…
          </MenuItem>

          <MenuDivider />

          <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            Export
          </div>
          <MenuItem
            onClick={() => run(onExportCSV)}
            className="text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-700/80"
          >
            ↓ Full program list (CSV)
          </MenuItem>
          <MenuItem
            onClick={() => run(onExportShortlist)}
            disabled={shortlistCount === 0}
            className="text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-700/80"
          >
            ↓ Shortlist{shortlistCount > 0 ? ` (${shortlistCount})` : ''}
          </MenuItem>
          <MenuItem
            onClick={() => run(onExportMyList)}
            disabled={myListCount === 0}
            className="text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-700/80"
          >
            My List (signaled / connected / noted){myListCount > 0 ? ` (${myListCount})` : ''}
          </MenuItem>

          <MenuDivider />

          <MenuItem
            onClick={() => run(onPrint)}
            className="text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-700/80"
          >
            Print / PDF
          </MenuItem>

          <MenuDivider />

          <MenuItem
            onClick={() => run(onClearData)}
            className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            Clear saved data…
          </MenuItem>
        </div>
      )}
    </div>
  )
}
