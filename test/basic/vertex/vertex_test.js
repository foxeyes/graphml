import {renderLit, renderStruct} from '../../../render.js'

const my_component = function(name, secondName) {
  return renderLit( /*html*/ `<div>${name} ${secondName}</div>`)
}

window.onload = () => {
  document.body.appendChild(renderStruct([
    {
      c: [
        my_component('John', 'Snow')
      ]
    }
  ]))
}
