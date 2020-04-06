import {Tpl} from './render.js'
import {StateMngr} from './state.js'
class Component extends HTMLElement {
  setLocalStateScheme(scheme) {
    if (!this._localState) {
      this._localState = StateMngr.registerLocal(this, scheme)
    }
  }
  get localState() {
    return this._localState || StateMngr.getLocalState(this) || StateMngr.global
  }
  get globalState() {
    return StateMngr.global
  }
  localSub(path, callback) {
    let sub = this.localState.sub(path, callback)
    this.__subscriptions.add(sub)
    return sub
  }
  localPub(path, val) {
    this.localState.pub(path, val)
  }
  globalSub(path, callback) {
    let sub = StateMngr.global.sub(path, callback)
    this.__subscriptions.add(sub)
    return sub
  }
  globalPub(path, val) {
    StateMngr.global.pub(path, val)
  }
  constructor() {
    super()
    this.__subscriptions = new Set()
  }
  /**
   *
   * @param {DocumentFragment} fragment
   */
  __parseFr(fragment) {
    let stateTypes = {
      local: 'b-l',
      global: 'b-g'
    }
    for (let sType in stateTypes) {
      let attr = stateTypes[sType];
      [...fragment.querySelectorAll(`[${attr}]`)].forEach((el) => {
        let bKey = el.getAttribute(attr)
        let pairsArr = bKey.split(';')
        pairsArr.forEach((pair) => {
          if (!pair) {
            return
          }
          let keyValArr = pair.split(':')
          let propName = keyValArr[0].trim()
          let valKey = keyValArr[1].trim()
          if (propName.indexOf('@') === 0) {
            let attrName = propName.replace('@', '')
            this[sType + 'Sub'](valKey, (val) => {
              el.setAttribute(attrName, val)
            })
          } else {
            this[sType + 'Sub'](valKey, (val) => {
              if (propName === 'innerTpl' && val.constructor === Tpl) {
                while (el.firstChild) {
                  el.firstChild.remove()
                }
                el.appendChild(val.clone)
              } else if (propName === 'innerFragment' && val.constructor === DocumentFragment) {
                while (el.firstChild) {
                  el.firstChild.remove()
                }
                el.appendChild(val)
              } else {
                el[propName] = val
              }
            })
          }
        })
        el.removeAttribute(attr)
      })
    }
  }
  attached() {
    this.__attached = true
    // @ts-ignore
    if (this.constructor.__tpl) {
      /** @type {DocumentFragment} */
      // @ts-ignore
      let fr = this.constructor.__tpl.clone
      this.__parseFr(fr)
      this.appendChild(fr)
    }
  }
  connectedCallback() {
    if (!this.__attached) {
      this.attached()
    }
  }
  disconnectedCallback() {
    this.__subscriptions.forEach((sub) => {
      sub.remove()
    })
    this.__subscriptions = null
    if (this.localState) {
      this.localState.remove()
    }
  }
  /**
   * @param {Array<String>} arr
   */
  static set attrs(arr) {
    if (arr.length) {
      Object.defineProperty(this, 'observedAttributes', {
        get: () => {
          return [...arr]
        },
      })
    }
  }
  attributeChangedCallback(name, oldVal, newVal) {
    if (newVal === oldVal) {
      return
    }
    this[name] = newVal
  }
  /**
   * @param {String} name
   */
  static set is(name) {
    if (window.customElements.get(name)) {
      return
    }
    this.__is = name
    window.customElements.define(name, this)
  }
  static get is() {
    return this.__is
  }
  static set template(tpl) {
    this.__tpl = new Tpl(tpl)
  }
}
export {Component}
