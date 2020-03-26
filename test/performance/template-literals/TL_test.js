const SIZE = 500
const STARTED = Date.now()

/**
 *
 * @param {String} name
 * @param {String} secondName
 * @param {Number} age
 */
const userCard = function(name, secondName, age) {
  return /*html*/ `<div class="user-card" tabindex="0"><div>Name: ${name}</div><div>Second Name: ${secondName}</div><div>Age: ${age}</div></div>`
}

window.onload = () => {
  document.body.innerHTML = /*html*/ `<div class="container">${[...Array(SIZE)].map(() => userCard('John', 'Snow', 24)).join('')}</div>`;

  window.requestAnimationFrame(() => {
    console.log(Date.now() - STARTED);
  })
}

