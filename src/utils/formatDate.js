// UTC on purpose: "2026-09-06T00:00:00Z" must read 6 Sep for everyone,
// not 5 Sep for people in a timezone behind UTC.
const formatter = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeZone: 'UTC' })

export function formatDate(isoString) {
  return formatter.format(new Date(isoString))
}
