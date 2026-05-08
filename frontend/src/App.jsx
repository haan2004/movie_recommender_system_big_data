import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchFeed, sendClickAction } from './action'
import Dashboard from './Dashboard'
import KafkaFeed from './components/KafkaFeed'
import Nav from './components/Nav'
import MovieDetail from './MovieDetail'
import SearchPage from './SearchPage'
import './style/dashboard.css'

function App() {
  const [route, setRoute] = useState(() => readRoute())
  const [feed, setFeed] = useState([])
  const [recommendations, setRecommendations] = useState([])

  const refreshFeed = useCallback(async () => {
    try {
      const data = await fetchFeed()
      setFeed(data.feed ?? [])
      setRecommendations(movieListFromResponse(data))
    } catch {
      setFeed([])
    }
  }, [])

  useEffect(() => {
    const initialRefreshId = window.setTimeout(refreshFeed, 0)
    const intervalId = window.setInterval(refreshFeed, 1000)
    return () => {
      window.clearTimeout(initialRefreshId)
      window.clearInterval(intervalId)
    }
  }, [refreshFeed])

  useEffect(() => {
    function handlePopState() {
      setRoute(readRoute())
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const navigate = useCallback((path) => {
    window.history.pushState({}, '', path)
    setRoute(readRoute())
  }, [])

  const handleSearch = useCallback(
    (query) => {
      navigate(`/search?q=${encodeURIComponent(query)}`)
    },
    [navigate],
  )

  const handleOpenMovie = useCallback(
    (movie) => {
      if (!movie?.id) {
        return
      }

      sendClickAction(movie.id)
        .then((data) => {
          setRecommendations(movieListFromResponse(data))
          refreshFeed()
        })
        .catch(() => {
          refreshFeed()
        })

      navigate(`/movie/${movie.id}`)
    },
    [navigate, refreshFeed],
  )

  const page = useMemo(() => {
    if (route.name === 'search') {
      return (
        <SearchPage
          query={route.query}
          recommendations={recommendations}
          onOpenMovie={handleOpenMovie}
        />
      )
    }

    if (route.name === 'movie') {
      return (
        <MovieDetail
          movieId={route.movieId}
          recommendations={recommendations}
          onOpenMovie={handleOpenMovie}
          onRated={refreshFeed}
        />
      )
    }

    return <Dashboard recommendations={recommendations} onOpenMovie={handleOpenMovie} />
  }, [handleOpenMovie, recommendations, refreshFeed, route])

  return (
    <div className="app-shell">
      <Nav
        key={`${route.name}-${route.query ?? ''}`}
        initialQuery={route.query ?? ''}
        onNavigate={navigate}
        onSearch={handleSearch}
      />
      <div className="app-layout">
        <main className="main-content">{page}</main>
        <KafkaFeed feed={feed} />
      </div>
    </div>
  )
}

function readRoute() {
  const { pathname, search } = window.location
  const params = new URLSearchParams(search)

  if (pathname === '/search') {
    return {
      name: 'search',
      query: params.get('q') ?? '',
    }
  }

  const movieMatch = pathname.match(/^\/movie\/(\d+)$/)
  if (movieMatch) {
    return {
      name: 'movie',
      movieId: Number(movieMatch[1]),
      query: '',
    }
  }

  return {
    name: 'dashboard',
    query: '',
  }
}

function movieListFromResponse(data) {
  if (Array.isArray(data?.recommendation_movies)) {
    return data.recommendation_movies
  }
  return []
}

export default App
