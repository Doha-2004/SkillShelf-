import { http } from '../api/apiClient'
import { fetchAdapter } from './fetchAdapter'

// Applies to every test file (see vite.config.js -> test.setupFiles).
http.defaults.adapter = fetchAdapter
