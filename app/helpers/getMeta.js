export default function(name) {
  return JSON.parse(document.querySelector(`meta[name="${name}"]`).content)
}
