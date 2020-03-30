import {renderLit, renderStruct} from '../../../graph-ml.js'

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
