import { useEffect, useState } from 'react'
import { searchMovies } from './action'
import { ExtendedCard } from './components/Card'
import Recommendation from './components/Recommendation'

function SearchPage({ query, recommendations, onOpenMovie }) {
  const [searchState, setSearchState] = useState({
    query: '',
    results: [],
    error: '',
  })
  const trimmedQuery = query.trim()
  const isCurrentQuery = searchState.query === trimmedQuery
  const results = trimmedQuery && isCurrentQuery ? searchState.results : []
  const status = getSearchStatus(trimmedQuery, searchState, isCurrentQuery)

  useEffect(() => {
    let isMounted = true

    if (!trimmedQuery) {
      return () => {
        isMounted = false
      }
    }

    searchMovies(trimmedQuery)
      .then((data) => {
        if (!isMounted) {
          return
        }
        setSearchState({
          query: trimmedQuery,
          results: data.results ?? [],
          error: '',
        })
      })
      .catch(() => {
        if (isMounted) {
          setSearchState({
            query: trimmedQuery,
            results: [],
            error: 'Search is unavailable. Start the Flask API and Qdrant, then try again.',
          })
        }
      })

    return () => {
      isMounted = false
    }
  }, [trimmedQuery])

  return (
    <div className="page-stack">
      <section className="search-results">
        <div className="row-heading">
          <h1>Search results</h1>
          <span>{status}</span>
        </div>

        <div className="result-list">
          {results.map((movie) => (
            <ExtendedCard key={movie.id} movie={movie} query={trimmedQuery} onOpen={onOpenMovie} />
          ))}
        </div>
      </section>

      <Recommendation movies={recommendations} onOpen={onOpenMovie} />
    </div>
  )
}

function getSearchStatus(query, searchState, isCurrentQuery) {
  if (!query) {
    return 'Type a search above.'
  }
  if (!isCurrentQuery) {
    return 'Searching...'
  }
  if (searchState.error) {
    return searchState.error
  }
  if (searchState.results.length === 0) {
    return `No results for "${query}"`
  }
  return `${searchState.results.length} results for "${query}"`
}

export default SearchPage
