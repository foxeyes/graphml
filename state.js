import {UID} from './uid.js';

export class State {
  /**
   *
   * @param {Object} src
   * @param {*} [src.element]
   * @param {Object.<string, *>} src.schema
   */
  constructor(src) {
    this.uid = UID.generate();
    this.element = src.element || null;
    this.store = JSON.parse(JSON.stringify(src.schema));
    /** @type {Object.<String, Set<Function>>} */
    this.callbackMap = Object.create(null);
  }

  /**
   *
   * @param {String} actionName
   * @param {String} prop
   */
  _warn(actionName, prop) {
    console.warn(`(GState) Cannot ${actionName}. Prop name: ` + prop);
  }

  /**
   *
   * @param {String} prop
   */
  read(prop) {
    if (this.store[prop] === undefined) {
      this._warn('read', prop);
      return;
    }
    return this.store[prop];
  }

  /**
   *
   * @param {String} prop
   * @param {*} val
   */
  pub(prop, val) {
    if (this.store[prop] === undefined) {
      this._warn('publish', prop);
      return;
    }
    this.store[prop] = val
    if (this.callbackMap[prop]) {
      this.callbackMap[prop].forEach((callback) => {
        callback(this.store[prop]);
      });
    }
  }

  /**
   *
   * @param {String} prop
   * @param {Function} callback
   */
  sub(prop, callback) {
    if (this.store[prop] === undefined) {
      this._warn('subscribe', prop);
      return;
    }
    if (!this.callbackMap[prop]) {
      this.callbackMap[prop] = new Set();
    }
    this.callbackMap[prop].add(callback);
    callback(this.store[prop]);
    return {
      remove: () => {
        this.callbackMap[prop].delete(callback);
      },
      callback: callback,
    }
  }

  remove() {
    delete StateMngr.globalStore[this.uid];
    this.callbackMap = null;
  }

}

export class StateMngr {

  static get uidKey() {
    return '__G_STATE_UID__';
  }

  /**
   *
   * @param {*} element
   * @param {Object.<string, *>} schema
   */
  static registerLocal(element, schema) {
    let state = new State({
      element: element,
      schema: schema,
    });
    StateMngr.globalStore[state.uid] = state;
    element[this.uidKey] = state.uid;
    return state;
  }

  /**
  *
  * @param {Object.<string, *>} schema
  */
  static registerGlobal(schema) {
    let state = new State({
      element: null,
      schema: schema,
    })
    StateMngr.globalStore[state.uid] = state;
    this.global = state;
    return state;
  }

  /**
   *
   * @param {*} element
   * @returns {State}
   */
  static getLocalState(element) {
    let el=element
    while (el && !el[this.uidKey]) {
      // @ts-ignore
      el = el.parentNode || el.parentElement || el.host;
    }
    if (el) {
      return this.globalStore[el[this.uidKey]];
    } else {
      return null;
    }
  }

}
StateMngr.globalStore = Object.create(null);
