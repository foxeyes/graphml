class GNode {
  /**
   *
   * @param {Object} [src]
   * @param {String} [src.t] Tag
   * @param {Object} [src.s] Styles
   * @param {Object} [src.p] Properties
   * @param {Object} [src.a] Attributes
   * @param {Object} [src.h] Handlers
   * @param {Array<*>} [src.c] Children array
   * @param {Function} [src.f] Callback function
   * @param {Object.<string, function>} [src.l] Element lifecycle
   */
  constructor(src = {}) {
    this.tag = src.t || 'div';
    this.styles = src.s || {};
    this.params = src.p || {};
    this.attributes = src.a || {};
    this.handlers = src.h || {};
    this.children = src.c || [];
    this.fCallback = src.f || null;
    this.lifecycle = src.l || {};
  }
}

const gLifecycleKey = '__g-lifecycle-key__';

class GLifeCycleEmitter extends HTMLElement {
  connectedCallback() {
    // @ts-ignore
    let host = this.parentNode.host;
    host[gLifecycleKey] && host[gLifecycleKey].connected && host[gLifecycleKey].connected(host);
  }
  disconnectedCallback() {
    // @ts-ignore
    let host = this.parentNode.host;
    host[gLifecycleKey] && host[gLifecycleKey].disconnected && host[gLifecycleKey].disconnected(host);
  }
}

const toKebab = function(str) {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
};

const prepRoot = function(element) {
  if (!element.shadowRoot) {
    element.attachShadow({
      mode: 'open',
    });
  }
}

const prepSlot = function(element) {
  if (!element.shadowRoot.querySelector('slot')) {
    element.shadowRoot.appendChild(document.createElement('slot'));
  }
}

/**
 *
 * @param {Array<{} | String | DocumentFragment>} template
 */
function render(template) {
  /**
   *
   * @param {*} node
   * @param {Element | DocumentFragment} targetNode
   */
  let renderNode = (node, targetNode) => {
    if (node.constructor === DocumentFragment) {
      targetNode.appendChild(node);
    } else if (node.constructor === String) {
      targetNode.appendChild(document.createTextNode(node));
    } else if (node.constructor === Object) {
      let elDesc = new GNode(node);
      let element;
      let svgPrefix = 'svg:';
      if (elDesc.tag.indexOf(svgPrefix) === 0) {
        element = document.createElementNS(
          'http://www.w3.org/2000/svg',
          elDesc.tag.replace(svgPrefix, ''),
        );
      } else {
        element = document.createElement(elDesc.tag);
      }
      let shadowStyleEl;
      for (let styleProp in elDesc.styles) {
        let value = elDesc.styles[styleProp];
        if (value.constructor === Object) {
          prepRoot(element);
          if (!shadowStyleEl) {
            shadowStyleEl = document.createElement('style');
            element.shadowRoot.appendChild(shadowStyleEl);
          }
          prepSlot(element);
          let rules = [];
          for (let sProp in value) {
            rules.push(`${toKebab(sProp)}:${value[sProp]}!important;`);
          }
          if (styleProp.indexOf('::') === 0) {
            shadowStyleEl.textContent += `:host${styleProp}{${rules.join('')}}`;
          } else {
            shadowStyleEl.textContent += `:host(${styleProp}){${rules.join('')}}`;
          }
        } else {
          element.style[styleProp] = value;
        }
      }
      for (let param in elDesc.params) {
        element[param] = elDesc.params[param];
      }
      for (let attr in elDesc.attributes) {
        element.setAttribute(attr, elDesc.attributes[attr]);
      }
      for (let eventName in elDesc.handlers) {
        element.addEventListener(eventName, elDesc.handlers[eventName]);
      }
      if (node.constructor === String) {
        element.setAttribute(node, '');
      }
      targetNode.appendChild(element);
      elDesc.children.forEach(child => {
        renderNode(child, element);
      });
      if (elDesc.fCallback && elDesc.fCallback.constructor === Function) {
        elDesc.fCallback(element);
      }
      if (elDesc.lifecycle && Object.keys(elDesc.lifecycle).length) {
        element[gLifecycleKey] = elDesc.lifecycle;
        let wcName = 'g-lifecycle-emmitter';
        if (!window.customElements.get(wcName)) {
          window.customElements.define(wcName, GLifeCycleEmitter);
        }
        prepRoot(element);
        prepSlot(element);
        let emitter = new GLifeCycleEmitter();
        emitter.style.display = 'none';
        element.shadowRoot.appendChild(emitter);
      }
    }
  };
  let fragment = document.createDocumentFragment();
  template.forEach(node => {
    renderNode(node, fragment);
  });
  return fragment;
}

export const GraphMl = {
  render: render,
};
