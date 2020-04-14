function cloneObj(obj) {
  let clone = (o) => {
    for (let prop in o) {
      if (o[prop] && o[prop].constructor === Object) {
        o[prop] = clone(o[prop]);
      }
    }
    return {...o};
  }
  return clone(obj);
}

export class State {
  /**
   *
   * @param {Object} src
   * @param {*} [src.element]
   * @param {String} [src.name]
   * @param {Object.<string, *>} src.schema
   */
  constructor(src) {
    this.uid = Symbol();
    this.element = src.element || null;
    this.name = src.name || null;
    this.store = cloneObj(src.schema);
    /** @type {Object.<String, Set<Function>>} */
    this.callbackMap = Object.create(null);
  }

  /**
   *
   * @param {String} actionName
   * @param {String} prop
   */
  _warn(actionName, prop) {
    console.warn(`State: cannot ${actionName}. Prop name: ` + prop);
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
  }

}

export class StateMngr {

  static get ctxKey() {
    return '__CTX_UID__';
  }

  /**
   *
   * @param {*} element
   * @param {Object.<string, *>} schema
   */
  static registerLocalCtx(element, schema) {
    let state = new State({
      element: element,
      schema: schema,
    });
    StateMngr.globalStore[state.uid] = state;
    element[this.ctxKey] = state.uid;
    return state;
  }

  /**
  *
  * @param {String} ctxName
  * @param {Object.<string, *>} schema
  */
  static registerNamedCtx(ctxName, schema) {
    let state = new State({
      name: ctxName,
      schema: schema,
    });
    if (!StateMngr.globalStore[ctxName]) {
      StateMngr.globalStore[ctxName] = state;
      return state;
    } else {
      console.warn('State: context name "' + ctxName + '" already in use');
    }
  }

  static getNamedCtx(ctxName) {
    return StateMngr.globalStore[ctxName] || (console.warn('State: wrong context name - "' + ctxName + '"'), null);
  }

  /**
   *
   * @param {*} element
   * @returns {State}
   */
  static getLocalCtx(element) {
    let el = element
    while (el && !el[this.ctxKey]) {
      // @ts-ignore
      el = el.parentNode || el.parentElement || el.host;
    }
    return el ? this.globalStore[el[this.ctxKey]] : null;
  }

}
StateMngr.globalStore = Object.create(null);
