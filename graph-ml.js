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
function renderStruct(template) {
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
      let element = document.createElement(node.t||'div');
      if (node.s) {
        let shadowStyleEl;
        for (let styleProp in node.s) {
          let value=node.s[styleProp];
          if (value.constructor === Object) {
            prepRoot(element);
            if (!shadowStyleEl) {
              shadowStyleEl=document.createElement('style');
              element.shadowRoot.appendChild(shadowStyleEl);
            }
            prepSlot(element);
            let rules=[];
            for (let sProp in value) {
              rules.push(`${toKebab(sProp)}:${value[sProp]}!important;`);
            }
            if (styleProp.indexOf('::') === 0) {
              shadowStyleEl.textContent+=`:host${styleProp}{${rules.join('')}}`;
            } else {
              shadowStyleEl.textContent+=`:host(${styleProp}){${rules.join('')}}`;
            }
          } else {
            element.style[styleProp] = value;
          }
        }
      }
      if (node.p) {
        for (let param in node.p) {
          element[param] = node.p[param];
        }
      }
      if (node.a) {
        for (let attr in node.a) {
          element.setAttribute(attr, node.a[attr]);
        }
      }
      if (node.h) {
        for (let eventName in node.h) {
          element.addEventListener(eventName, node.h[eventName]);
        }
      }
      targetNode.appendChild(element);
      if (node.c) {
        node.c.forEach(child => {
          renderNode(child, element);
        });
      }
      if (node.f) {
        node.f(element);
      }
      if (node.l && Object.keys(node.l).length) {
        element[gLifecycleKey] = node.l;
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
/**
 *
 * @param {String} tplStr
 * @param {Object.<string, Function>} [mapper]
 */
function renderLit(tplStr, mapper) {
  let tpl=document.createElement('template');
  tpl.innerHTML = tplStr;
  let fragment = tpl.content.cloneNode(true);
  if (mapper) {
    for (let id in mapper) {
      // @ts-ignore
      let el=fragment.querySelector('['+id+']');
      if (el) {
        mapper[id](el);
        el.removeAttribute(id);
      }
    }
  }
  return fragment;
}
export {renderStruct, renderLit}
