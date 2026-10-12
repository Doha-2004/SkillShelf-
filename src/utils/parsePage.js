const MAX_INT32 = 2147483647 // the API documents page as int32

// The URL is user input: anyone can type ?page=abc or ?page=-5.
// Accept only a plain positive integer; anything else means "page 1".
export function parsePage(value) {
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) return 1
  const page = Number(value)
  return page > MAX_INT32 ? 1 : page
}
