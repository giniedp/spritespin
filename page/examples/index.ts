const prefix = '/examples'
const links = document.querySelectorAll('a.example-link')
const embed = document.querySelector('.example-embed')

links.forEach((link) => {
  const href = link.getAttribute('href')
  if (href.startsWith(prefix)) {
    link.setAttribute('href', href.replace(prefix, '#'))
    if (!location.hash) {
      location.hash = link.getAttribute('href')
    }
  }
})

function showExample(hash: string) {
  embed.setAttribute('src', hash.replace(/^\#?/, prefix))
}

window.addEventListener('hashchange', () => {
  showExample(location.hash)
})
if (location.hash) {
  showExample(location.hash)
}
