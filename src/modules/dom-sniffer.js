'use strict'

import XObjMaster from './xobj-master'
import { passRule } from '../content'


const domProbe = {
  probing: true,
  newRuleType: undefined,
  targetElement: {
    element: undefined,
    xpath: undefined,

    assign: function assign(elem) {
      this.removeOutline()
      this.xpath = XObjMaster.getXPathTo(elem)
      this.element = XObjMaster.getElementNode(this.xpath)
      this.drawOutline()
    },

    drawOutline: function drawOutline() {
      if (this.element !== undefined) {
        let domRect = this.element.getBoundingClientRect();
        this.overlay.style.width = domRect.width + 'px'
        this.overlay.style.height = domRect.height + 'px'
        this.overlay.style.top = domRect.top + 'px'
        this.overlay.style.left = domRect.left + 'px'
      }
    },
    removeOutline: function removeOutline() {
      this.overlay.style.width = '0px'
      this.overlay.style.height = '0px'
      this.overlay.style.top = '0px'
      this.overlay.style.left = '0px'
    },

    expandSelection: function expandSelection() {
      if (this.element.parentNode !== undefined && this.element.parentNode.tagName !== 'BODY')
        this.assign(this.element.parentNode)
    },
    shrinkSelection: function shrinkSelection() {
      if (this.element.firstElementChild !== null)
        this.assign(this.element.firstElementChild)
    }
  },
  origEventActions: {},

  startProbing: function startProbing(ruleType) {
    this.probing = true
    this.newRuleType = ruleType
    this.saveOrigActions()
    this.setSelectMode()

    this.targetElement.overlay = document.createElement('div')
    this.targetElement.overlay.id = 'purify-overlay'
    this.targetElement.overlay.style.position = 'fixed'
    this.targetElement.overlay.style.backgroundColor = 'rgba(150, 0, 0, .5)'
    this.targetElement.overlay.style.border = '1px solid rgba(255, 255, 255, .5)'
    this.targetElement.overlay.style.pointerEvents = 'none'
    this.targetElement.overlay.style.zIndex = '9999'

    document.addEventListener('scroll', drawOutline)
    document.body.appendChild(this.targetElement.overlay)
    document.body.style.cursor = 'pointer'
  },

  setSelectMode: function setSelectState() {
    this.cancelProbeByEsc()
    this.saveHoveredElement()
    this.clickSetsAdjustMode()

    document.onclick = (event) => {
      event.stopPropagation()
      event.preventDefault()
    }
  },

  setAdjustMode: function setAdjustState() {
    document.onmouseover = this.origEventActions.mouseOver
    /* document.onclick = this.origEventActions.mouseClick */
    document.onmouseup = this.origEventActions.mouseUp
    document.body.style.cursor = 'auto'
    this.expandSelectionMenu()
  },

  stopProbing: function setDefaultState() {
    if (!this.probing) {
      return;
    }

    this.probing = false
    chrome.runtime.sendMessage({ 'iframe-type': 'stop' })
    document.removeEventListener('scroll', drawOutline)
    document.onkeydown = this.origEventActions.keyDown
    document.onmouseover = this.origEventActions.mouseOver
    document.onmouseup = this.origEventActions.mouseUp
    document.onclick = this.origEventActions.mouseClick
    document.body.style.cursor = 'auto'
    document.getElementById('purifyExtIframeContainer').style.pointerEvents = 'none'
    this.targetElement.removeOutline()
  },

  saveOrigActions: function saveOrigActions() {
    this.origEventActions.keyDown = document.onkeydown
    this.origEventActions.mouseOver = document.onmouseover
    this.origEventActions.mouseUp = document.onmouseup
    this.origEventActions.mouseClick = document.onclick
  },

  cancelProbeByEsc: function listenToEscape() {
    document.onkeydown = (event) => {
      if (event.key === 'Escape' || event.key === 'Esc') {
        this.stopProbing()
      }
    }
  },

  saveHoveredElement: function catchMouseTarget() {
    document.onmouseover = (event) => {
      this.targetElement.assign(event.target)
    }
  },

  clickSetsAdjustMode: function clickSetsAdjustMode() {
    document.onmouseup = (event) => {
      event.stopPropagation()
      event.preventDefault()
      this.setAdjustMode()
    }
  },

  clickSetsSelectMode: function clickSetsSelectMode() {
    document.onmouseup = (event) => {
      event.preventDefault()
      event.stopPropagation()
      this.setSelectMode()
    }
  },

  expandSelectionMenu: function expandSelectionMenu() {
    document.getElementById('purifyExtIframeContainer').style.pointerEvents = 'auto'
    chrome.runtime.sendMessage({ 'iframe-type': 'expandSelectionMenu' }) // 'type': 'iframeMsg',
  },

  saveRule: function saveRule(name, operation) {
    let rule = {
      'name': name,
      'operation': operation,
      'obj': { 'xpath': this.targetElement.xpath }
    }
    this.stopProbing()
    passRule(this.newRuleType, rule)
  }
}

function drawOutline() {
  domProbe.targetElement.drawOutline()
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "domSniffMsg" && domProbe.probing) {
    switch(message['iframe-type']) {
      case "expand":
        domProbe.targetElement.expandSelection()
        break

      case "shrink":
        domProbe.targetElement.shrinkSelection()
        break

      case "save-rule":
        domProbe.saveRule(message.name, message.operation)
        break

      case "stop":
        domProbe.stopProbing()
        break
    }
  }
})


export default domProbe
