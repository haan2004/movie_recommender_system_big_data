import { useEffect, useState } from 'react'
import { fetchMovie, sendRateAction } from './action'
import Recommendation from './components/Recommendation'

function MovieDetail({ movieId, recommendations, onOpenMovie, onRated }) {
  const [movieState, setMovieState] = useState({
    movieId: null,
    movie: null,
    error: '',
  })
  const [rating, setRating] = useState(5)
  const [ratingStatus, setRatingStatus] = useState({ movieId: null, text: '' })
  const isCurrentMovie = movieState.movieId === movieId
  const movie = isCurrentMovie ? movieState.movie : null
  const status = getDetailStatus(movieId, movieState, isCurrentMovie, ratingStatus)

  useEffect(() => {
    let isMounted = true

    fetchMovie(movieId)
      .then((data) => {
        if (isMounted) {
          setMovieState({
            movieId,
            movie: data.movie,
            error: '',
          })
        }
      })
      .catch(() => {
        if (isMounted) {
          setMovieState({
            movieId,
            movie: null,
            error: 'Movie details are unavailable.',
          })
        }
      })

    return () => {
      isMounted = false
    }
  }, [movieId])

  async function handleSubmit(event) {
    event.preventDefault()
    if (!movie) {
      return
    }

    const ratingLabel = `${rating} star${rating === 1 ? '' : 's'}`
    const confirmed = window.confirm(`Send ${ratingLabel} for "${movie.title}"?`)
    if (!confirmed) {
      return
    }

    setRatingStatus({ movieId: movie.id, text: 'Sending rating...' })
    try {
      await sendRateAction(movie.id, rating)
      setRatingStatus({ movieId: movie.id, text: `Rated ${ratingLabel}.` })
      onRated?.()
    } catch {
      setRatingStatus({
        movieId: movie.id,
        text: 'Could not send rating. Check the Flask API and Kafka services.',
      })
    }
  }

  return (
    <div className="page-stack">
      {movie ? (
        <article className="detail-layout">
          <div className="detail-poster">
            {movie.poster ? (
              <img src={movie.poster} alt={`${movie.title} poster`} />
            ) : (
              <div className="poster-placeholder">
                <span>Movie</span>
              </div>
            )}
          </div>

          <div className="detail-copy">
            <p className="eyebrow">Movie detail</p>
            <h1>{movie.title}</h1>
            <p className="meta-line">
              {[movie.year, movie.genres].filter(Boolean).join(' • ')}
            </p>
            <p className="description">{movie.description || 'No description available.'}</p>

            <form className="rating-form" onSubmit={handleSubmit}>
              <fieldset>
                <legend>Rate this movie</legend>
                <div className="star-options">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <label key={value} className={value <= rating ? 'selected' : ''}>
                      <input
                        type="radio"
                        name="rating"
                        value={value}
                        checked={rating === value}
                        aria-label={`${value} star${value === 1 ? '' : 's'}`}
                        onChange={() => setRating(value)}
                      />
                      <span aria-hidden="true">★</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <button type="submit">Submit rating</button>
            </form>

            {status && <p className="status-line">{status}</p>}
          </div>
        </article>
      ) : (
        <section className="empty-state">{status}</section>
      )}

      <Recommendation movies={recommendations} onOpen={onOpenMovie} />
    </div>
  )
}

function getDetailStatus(movieId, movieState, isCurrentMovie, ratingStatus) {
  if (ratingStatus.movieId === movieId && ratingStatus.text) {
    return ratingStatus.text
  }
  if (!isCurrentMovie) {
    return 'Loading movie...'
  }
  if (movieState.error) {
    return movieState.error
  }
  if (!movieId) {
    return 'Movie details are unavailable.'
  }
  return ''
}

export default MovieDetail
