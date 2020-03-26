export class Vertex {
  static render(tplStr, mapper) {
    let tpl = document.createElement('template')
    tpl.innerHTML = tplStr
    let fragment = tpl.content.cloneNode(true)
    if (mapper) {
      for (let id in mapper) {
        // @ts-ignore
        let el = fragment.querySelector('['+id+']')
        if (el) {
          mapper[id](el)
          el.removeAttribute(id)
        }
      }
    }
    return fragment
  }
}
