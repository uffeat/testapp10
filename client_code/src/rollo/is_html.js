export function is_html(text) {
  if (!(typeof text === 'string')) {
    return false
  }
  text = text.trim()
  return /<([a-zA-Z]+)(\s[^>]*)?>.*<\/\1>|<([a-zA-Z]+)(\s[^>]*)?\/>/i.test(text);
}