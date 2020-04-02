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
      let element = document.createElement(node.t || 'div');
      if (node.s) {
        let shadowStyleEl;
        for (let styleProp in node.s) {
          let value=node.s[styleProp];
          if (value.constructor === Object) {
            if (!element.shadowRoot) {
              element.attachShadow({
                mode: 'open',
              })
            }
            if (!shadowStyleEl) {
              shadowStyleEl=document.createElement('style');
              element.shadowRoot.appendChild(shadowStyleEl);
            }
            if (!element.shadowRoot.querySelector('slot')) {
              element.shadowRoot.appendChild(document.createElement('slot'))
            }
            let rules = [];
            for (let sProp in value) {
              rules.push(`${sProp.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()}:${value[sProp]}!important;`);
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
  let tpl = document.createElement('template');
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
export {renderStruct, renderLit};
