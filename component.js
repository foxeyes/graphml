import {Tpl} from './render.js'
import {StateMngr} from './state.js'
class Component extends HTMLElement {
  /**
   *
   * @param {String} propName
   * @param {Function} handler
   */
  defineAccessor(propName, handler) {
    let localPropName = '__' + propName;
    if (this[propName] !== undefined) {
      this[localPropName] = this[propName];
    }
    Object.defineProperty(this, propName, {
      set: (val) => {
        this[localPropName] = val;
        handler.bind(this)(val);
      },
      get: () => {
        return this[localPropName];
      },
    });
    if (this[localPropName]) {
      this[propName] = this[localPropName];
    }
  }
  setLocalStateScheme(scheme) {
    if (!this._localState) {
      this._localState = StateMngr.registerLocalCtx(this, scheme)
    }
  }
  get localState() {
    return this._localState || StateMngr.getLocalCtx(this)
  }
  localSub(path, callback) {
    let sub = this.localState.sub(path, callback)
    this.__subscriptions.add(sub)
    return sub
  }
  localPub(path, val) {
    this.localState.pub(path, val)
  }
  namedSub(ctxName, path, callback) {
    let sub = StateMngr.getNamedCtx(ctxName).sub(path, callback)
    this.__subscriptions.add(sub)
    return sub
  }
  namedPub(ctxName, path, val) {
    StateMngr.getNamedCtx(ctxName).pub(path, val)
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
    [...fragment.querySelectorAll('[bind]')].forEach((el) => {
      let bKey = el.getAttribute('bind')
      let pairsArr = bKey.split(';')
      pairsArr.forEach((pair) => {
        if (!pair) {
          return
        }
        let keyValArr = pair.split(':')
        let propName = keyValArr[0].trim()
        let valKey = keyValArr[1].trim()
        let sub;
        if (valKey.indexOf('[') === 0 && valKey.indexOf(']') !== -1) {
          let valArr = valKey.split(']');
          let ctxName = valArr[0].replace('[', '')
          valKey = valArr[1].trim()
          sub = (path, val) => {
            this.namedSub(ctxName, path, val)
          }
        } else {
          sub = this.localSub.bind(this)
        }
        if (propName.indexOf('@') === 0) {
          let attrName = propName.replace('@', '')
          sub(valKey, (val) => {
            el.setAttribute(attrName, val)
          })
        } if (propName.indexOf('$') === 0) {
          let param = propName.replace('$', '')
          sub(valKey, (fn) => {
            if (fn && fn.constructor === Function) {
              fn(el, param)
            }
          })
        } else {
          sub(valKey, (val) => {
            if (propName === 'innerTpl' && val.constructor === Tpl) {
              while (el.firstChild) {
                el.firstChild.remove()
              }
              let fr = val.clone
              // @ts-ignore
              this.__parseFr(fr)
              el.appendChild(fr)
            } else if (propName === 'innerFragment' && val.constructor === DocumentFragment) {
              while (el.firstChild) {
                el.firstChild.remove()
              }
              this.__parseFr(val)
              el.appendChild(val)
            } else {
              el[propName] = val
            }
          })
        }
      })
      el.removeAttribute('bind')
    })
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
