import {renderStruct, renderLit} from './render.js'
import {StateMngr} from './state.js'
class Component extends HTMLElement {
  /**
   * @param {DocumentFragment} tpl
   */
  static set template(tpl) {
    this._template = tpl
  }
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
    this._subscriptions.add(sub)
    return sub
  }
  localPub(path, val) {
    this.localState.pub(path, val)
  }
  globalSub(path, callback) {
    let sub = StateMngr.global.sub(path, callback)
    this._subscriptions.add(sub)
    return sub
  }
  globalPub(path, val) {
    StateMngr.global.pub(path, val)
  }
  constructor() {
    super()
    this._subscriptions = new Set()
  }
  disconnectedCallback() {
    this._subscriptions.forEach((sub) => {
      sub.remove()
    });
    this._subscriptions = null
    if (this.localState) {
      this.localState.remove()
    }
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
