import {renderStruct, renderLit} from './render.js'
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
  disconnectedCallback() {
    this.__subscriptions.forEach((sub) => {
      sub.remove()
    });
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
}
export {Component, renderStruct, renderLit}
