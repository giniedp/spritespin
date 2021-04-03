const prefix = '/examples'
const links = document.querySelectorAll('a.example-link')
const embed = document.querySelector('.example-embed')
const container = document.querySelector('.example-container')
const elTitle = document.querySelector('.example-title')
const btnPrev = document.querySelector('a.example-button-prev')
const btnNext = document.querySelector('a.example-button-next')
const btnMenu = document.querySelector('a.example-button-menu')

btnMenu.addEventListener('click', () => {
  container.classList.toggle('sidebar-off')
})
btnNext.addEventListener('click', () => {
  nextExample()
})
btnPrev.addEventListener('click', () => {
  prevExample()
})

links.forEach((link) => {
  const href = link.getAttribute('href')
  if (href.startsWith(prefix)) {
    link.setAttribute('href', href.replace(prefix, '#'))
    if (!location.hash) {
      location.hash = link.getAttribute('href')
    }
  }
})

function nextExample() {
  let open = false
  links.forEach((link) => {
    const attr = link.getAttribute('href')
    if (open && attr) {
      location.hash = attr
      open = false
    } else if (attr === location.hash) {
      open = true
    }
  })
}
function prevExample() {
  let prev = null
  links.forEach((link) => {
    const attr = link.getAttribute('href')
    if (attr === location.hash && prev) {
      location.hash = prev
    } else {
      prev = attr
    }
  })
}
function showExample(hash: string) {
  embed.setAttribute('src', hash.replace(/^\#?/, prefix))
  links.forEach((link) => {
    link.classList.remove('active')
    if (link.getAttribute('href') === hash) {
      link.classList.add('active')
      elTitle.textContent = link.textContent
    }
  })
  container.classList.add('sidebar-off')
}

window.addEventListener('hashchange', () => {
  showExample(location.hash)
})

if (location.hash) {
  showExample(location.hash)
}
