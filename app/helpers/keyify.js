export default function(str) {
  return str.replace(/[^a-zA-A-Z0-9\-\_]/g, '')
}
