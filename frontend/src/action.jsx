async function fetchJson(url, options = {}) {
  const response = await fetch(url, options)
  if (!response.ok) {
    throw new Error(`Server responded with status ${response.status}`)
  }
  return response.json()
}

async function sendClickAction(movieId) {
  return fetchJson(`/api/click/${movieId}`)
}

async function sendRateAction(movieId, rating) {
  return fetchJson(`/api/rate/${movieId}/${Number(rating).toFixed(1)}`)
}

async function searchMovies(query, limit = 50) {
  const params = new URLSearchParams({ q: query, limit: String(limit) })
  return fetchJson(`/api/search?${params.toString()}`)
}

async function fetchMovie(movieId) {
  return fetchJson(`/api/movie/${movieId}`)
}

async function fetchAverage(movieId) {
  return fetchJson(`/api/average_rating/${movieId}`)
}

async function fetchFeed() {
  return fetchJson('/api/feed')
}

async function fetchTrending() {
  return fetchJson('/api/trending')
}

function formatGenres(genres) {
  if (!genres && genres !== '') return genres
  // Ensure it's a string and normalize spacing after commas
  return String(genres).replace(/\s*,\s*/g, ', ')
}


export {
  fetchFeed,
  fetchJson,
  fetchMovie,
  fetchTrending,
  formatGenres,
  searchMovies,
  sendClickAction,
  sendRateAction,
  fetchAverage
}
