import { AxiosError, CanceledError } from 'axios'

// TEST-ONLY transport. In the browser axios talks to the server with XMLHttpRequest. In our
// tests every file already fakes the network by replacing `fetch`, so this adapter hands the
// request that axios prepared (URL, method, headers, JSON body, abort signal) to
// `globalThis.fetch` and turns the Response back into an axios response.
// Everything above the transport (axios config, headers, our ApiError rules) runs for real;
// only the last step, the actual network call, is fake. The real XHR path is checked in a
// browser (see README, "Verification").
export async function fetchAdapter(config) {
  let response
  try {
    response = await globalThis.fetch(config.url, {
      method: String(config.method ?? 'get').toUpperCase(),
      headers: config.headers.toJSON(),
      body: config.data,
      signal: config.signal,
    })
  } catch (error) {
    if (error?.name === 'AbortError') throw new CanceledError(null, config)
    throw AxiosError.from(error, AxiosError.ERR_NETWORK, config)
  }
  const result = {
    data: await response.text(),
    status: response.status,
    statusText: response.statusText,
    headers: Object.fromEntries(response.headers.entries()),
    config,
    request: null,
  }
  // Same rule as axios's real adapters ("settle"): a status that validateStatus rejects makes
  // the request fail with an AxiosError that carries the response.
  if (!config.validateStatus || config.validateStatus(result.status)) return result
  throw new AxiosError(
    `Request failed with status code ${result.status}`,
    result.status >= 500 ? AxiosError.ERR_BAD_RESPONSE : AxiosError.ERR_BAD_REQUEST,
    config,
    null,
    result,
  )
}
