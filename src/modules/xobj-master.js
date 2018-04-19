'use strict'

const ObjectMaster = {
  findElement: function findElement(object) {
    // todo: implement voting matching
    return document.evaluate(object.xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue
  },

  getElementNode: function getXpath(xpath) {
    let htmlElem = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.parentElement

    let ix = 0
    let children = htmlElem.children
    let lastXPathElem = xpath.split('/')
    lastXPathElem = lastXPathElem[lastXPathElem.length - 1]

    if (lastXPathElem.indexOf("*[@id=") >= 0) {
      let id = lastXPathElem.slice(7, -2)
      for (let i= 0; i<children.length; i++) {
        if (children[i].id === id)
          return children[i]
      }
    }
    else {
      lastXPathElem = lastXPathElem.slice(0, -1).split('[')
      let elemType = lastXPathElem[0]
      let elemIndex = parseInt(lastXPathElem[1])

      for (let i= 0; i<children.length; i++) {
        if (children[i].tagName === elemType) {
          ix = ix + 1
          if (ix === elemIndex)
            return children[i]
        }
      }
    }

    return undefined
  },

  getXPathTo: function getXPathTo(element) {
    if (element.id !== '') {
      return '//*[@id="' + element.id + '"]'
    }

    if (element===document.body) {
      return '//' + element.tagName;
    }

    let ix= 0;
    let siblings= element.parentNode.childNodes;
    for (let i= 0; i<siblings.length; i++) {
      let sibling = siblings[i];
      if (sibling === element) {
        return getXPathTo(element.parentNode) + '/' + element.tagName + '[' + (ix+1) + ']';
      }
      if (sibling.nodeType === 1 && sibling.tagName === element.tagName) {
        ix++;
      }
    }
  }

}

export default ObjectMaster
