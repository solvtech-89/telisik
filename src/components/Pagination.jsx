function Pagination({ count, page, pageSize, onPage }) {
  const totalPages = Math.ceil(count / pageSize)

  // --- build pages around current
  const pages = []
  const start = Math.max(1, page - 2)
  const end = Math.min(totalPages, page + 2)

  for (let p = start; p <= end; p++) {
    pages.push(p)
  }

  return (
    <ul className="pagination mt-3">
      <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
        <button className="page-link" onClick={() => onPage(page - 1)} disabled={page === 1}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
            strokeLinejoin="round" className="icon icon-1">
            <path d="M15 6l-6 6l6 6" />
          </svg>
        </button>
      </li>

      {pages.map(p => (
        <li key={p} className={`page-item ${p === page ? "active" : ""}`}>
          <button className="page-link" onClick={() => onPage(p)}>
            {p}
          </button>
        </li>
      ))}

      <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
        <button className="page-link" onClick={() => onPage(page + 1)} disabled={page === totalPages}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
            strokeLinejoin="round" className="icon icon-1">
            <path d="M9 6l6 6l-6 6" />
          </svg>
        </button>
      </li>
    </ul>
  )
}
