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
   */
  constructor(src = {}) {
    this.tag = src.t || 'div';
    this.styles = src.s || {};
    this.params = src.p || {};
    this.attributes = src.a || {};
    this.handlers = src.h || {};
    this.children = src.c || [];
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
      targetNode.appendChild(
        node.cloneNode({
          deep: true
        })
      );
    } else if (node.constructor === String) {
      let textEl = document.createElement('span');
      textEl.textContent = node;
      targetNode.appendChild(textEl);
    } else if (node.constructor === Object) {
      let elDesc = new GNode(node);
      let element;
      let svgPrefix = 'svg:';
      if (elDesc.tag.indexOf(svgPrefix) === 0) {
        element = document.createElementNS(
          'http://www.w3.org/2000/svg',
          elDesc.tag.replace(svgPrefix, '')
        );
      } else {
        element = document.createElement(elDesc.tag);
      }
      for (let styleProp in elDesc.styles) {
        element.style[styleProp] = elDesc.styles[styleProp];
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
    }
  };
  let fragment = document.createDocumentFragment();
  template.forEach(node => {
    renderNode(node, fragment);
  });
  return fragment;
}

export const GraphMl = {
  render: render
};
