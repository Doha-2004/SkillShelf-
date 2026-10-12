// Gives each category a stable "spine" shade (0-4) so cards of the same topic look related.
// It is decoration only: the category name is always written out as text.
export function categoryTone(categoryId) {
  const text = String(categoryId ?? '')
  let sum = 0
  for (let i = 0; i < text.length; i += 1) sum = (sum * 31 + text.charCodeAt(i)) % 5
  return sum
}
