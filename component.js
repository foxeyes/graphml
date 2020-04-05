import {Tpl, renderStruct, renderLit} from './render.js'
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
   * @param {'b-l' | 'b-g'} attr
   */
  __parseBindings(fragment, attr) {
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
          if (attr === 'b-l') {
            this.localSub(valKey, (val) => {
              el.setAttribute(attrName, val)
            })
          } else {
            this.globalSub(valKey, (val) => {
              el.setAttribute(attrName, val)
            })
          }
        } else {
          if (attr === 'b-l') {
            this.localSub(valKey, (val) => {
              el[propName] = val
            })
          } else {
            this.globalSub(valKey, (val) => {
              el[propName] = val
            })
          }
        }
      })
      el.removeAttribute(attr)
    })
  }
  attached() {
    this.__attached = true
    // @ts-ignore
    if (this.constructor.__litTpl) {
      /** @type {DocumentFragment} */
      // @ts-ignore
      let fr = this.constructor.__litTpl.clone
      this.__parseBindings(fr, 'b-l')
      this.__parseBindings(fr, 'b-g')
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
  static set logicAttributes(arr) {
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
  static set template(tplStr) {
    this.__litTpl = new Tpl(tplStr)
  }
}
export {Component, renderStruct, renderLit}
