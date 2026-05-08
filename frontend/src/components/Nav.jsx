import { useState } from 'react'

function Nav({ initialQuery = '', onNavigate, onSearch }) {
  const [query, setQuery] = useState(initialQuery)

  function handleSubmit(event) {
    event.preventDefault()
    const trimmed = query.trim()
    if (trimmed) {
      onSearch(trimmed)
    }
  }

  return (
    <nav className="navbar">
      <button type="button" className="brand" onClick={() => onNavigate('/')}>
        <span className="brand-mark">LW</span>
        <div className="eyebrow">Let's Watch!</div>
      </button>

      <form className="search-bar" onSubmit={handleSubmit}>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by title, genre, mood, or description"
          aria-label="Search movies"
        />
        <button type="submit">Search</button>
      </form>
    </nav>
  )
}

export default Nav
