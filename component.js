import {renderStruct, renderLit} from './render.js'
import {StateMngr} from './state.js'
class Component extends HTMLElement {
  /**
   * @param {DocumentFragment} tpl
   */
  static set template(tpl) {
    this._template = tpl
  }
  set localState(scheme) {
    if (!this._localState) {
      this._localState=StateMngr.registerLocal(this, scheme)
    }
  }
  get localState() {
    return this._localState
  }
  localSub(path, callback) {
    this._subscriptions.add(this._localState.sub(path, callback))
  }
  localPub(path, val) {
    this._localState.pub(path, val)
  }
  globalSub(path, callback) {
    this._subscriptions.add(StateMngr.global.sub(path, callback))
  }
  globalPub(path, val) {
    StateMngr.global.pub(path, val)
  }
  constructor() {
    super();
    this._subscriptions = new Set()
  }
  disconnectedCallback() {
    this._subscriptions.forEach((sub) => {
      sub.remove()
    });
    this._subscriptions = null
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
