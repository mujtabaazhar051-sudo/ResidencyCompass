export default function RerankBanner({ count, isRanking, onRerank }) {
  if (count <= 0) return null

  return (
    <div
      role="status"
      className="sticky top-0 z-30 -mx-4 border-b border-blue-200 bg-blue-50/95 px-4 py-2.5 shadow-sm backdrop-blur-sm dark:border-blue-900 dark:bg-blue-950/95 md:-mx-6 md:px-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <span className="font-semibold">{count} program{count !== 1 ? 's' : ''}</span>
          {' '}would move tier based on your latest profile or signal changes.
          {' '}
          <span className="text-blue-600 dark:text-blue-400">Update tier list to refresh.</span>
        </p>
        <button
          type="button"
          onClick={onRerank}
          disabled={isRanking}
          className="shrink-0 flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60"
        >
          {isRanking
            ? (
              <>
                <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Ranking…
              </>
            )
            : 'Update tier list'}
        </button>
      </div>
    </div>
  )
}
