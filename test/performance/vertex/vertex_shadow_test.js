import {Vertex} from '../../../vertex.js'
const SIZE = 500
const STARTED = performance.now()
const prepShadow = function(el, css) {
  el.attachShadow({
    mode: 'open'
  })
  let style = document.createElement('style')
  style.textContent = css
  el.shadowRoot.appendChild(style)
  el.shadowRoot.appendChild(document.createElement('slot'))
}
const userCard = function(name, secondName, age) {
  let tpl = /*html*/ `<div tabindex="0" shadow-css><div>Name: ${name}</div><div>Second Name: ${secondName}</div><div>Age: ${age}</div></div>`;
  return Vertex.render(tpl, {
    'shadow-css': (el) => {
      prepShadow(el, /*css*/ `
        :host {
          display:inline-grid;
          grid-gap:10px;
          padding:20px;
          border-radius:10px;
          background-color:#fff;
          color:rgb(50, 50, 50);
          transition:.2s;
          outline:none;
          user-select:none;
        }
        :host:focus {
          box-shadow:0 0 12px rgba(0, 0, 0, 0.2);
          transform:scale(1.2);
        }`
      )
    }
  })
}
window.onload = () => {
  let tpl = /*html*/ `<div insertion-point></div>`
  document.body.appendChild(Vertex.render(tpl, {
    'insertion-point': (el) => {
      prepShadow(el, /*css*/ `
        :host {
          display:grid;
          grid-template-columns:1fr 1fr 1fr 1fr;
          grid-gap:10px;
          background-color:#eee;
          padding:40px;
        }`
      )
      for (let i = 0; i < SIZE; i++) {
        el.appendChild(userCard('John', 'Snow', 24))
      }
    }
  }))
  // @ts-ignore
  window.requestIdleCallback(() => {
    console.log(performance.now() - STARTED)
  })
}
