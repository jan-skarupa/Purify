'use strict'

import ObjectMaster from './modules/xobj-master'
import DomProbe from './modules/dom-sniffer'
import RuleManager from './modules/rule-manager'
import { parseUrl } from './modules/utils'

function loadRules() {
  return new Promise(resolve => {
    chrome.runtime.sendMessage({type: 'getPageRules', url: location.href}, rules => {
      if (Object.keys(rules).length === 0) {
        resolve({
          cleanModeOn: false,
          readModeOn: false,
          cleanRules: {},
          readRules: {}
        })
      } else {
        resolve({
          cleanModeOn: rules['cleanModeOn'],
          readModeOn: false,
          cleanRules: rules['cleanRules'],
          readRules: rules['readRules']
        })
      }
    })
  })
}


const domManipulator = {
  domain: parseUrl(location.href).domain,
  rules: undefined,

  initRules: async function initRules() {
    let domLoaded = new Promise((resolve) => {
      document.addEventListener('DOMContentLoaded', () => { resolve(0) })
    })
    this.rules = await loadRules()

    await domLoaded
    this.findHtmlElements(this.rules['cleanRules'])
    this.findHtmlElements(this.rules['readRules'])

    addIframe()

    if (this.rules.cleanModeOn)
      this.applyRules(this.rules['cleanRules'])

    chrome.runtime.onMessage.addListener((message) => {
      switch(message.type) {
        case "getConfig":
          chrome.runtime.sendMessage({ 'type': 'setConfig', 'config': this.rules })
          break

        case "switchCleanMode":
          this.switchCleanMode()
          break

        case "switchReadMode":
          this.switchReadMode()
          break

        case "turnOnCleanMode":
          if (!this.rules.cleanModeOn)
            this.switchCleanMode()
          break

        case "deleteRule":
          this.deleteRule(message.ruleType, message.id)
          break
      }
    })

    chrome.runtime.sendMessage({ 'type': 'setConfig', 'config': this.rules})
  },

  findHtmlElements: function findHtmlElements(rules) {
    Object.keys(rules).forEach(id => {
      rules[id].element = ObjectMaster.findElement(rules[id].obj)
    })
  },

  switchCleanMode: function switchCleanMode() {
    this.rules.cleanModeOn = !this.rules.cleanModeOn
    if (this.rules.cleanModeOn) {
      this.applyRules(this.rules['cleanRules'])
    } else {
      this.removeRules(this.rules['cleanRules'])
    }

    RuleManager.setRules(this.domain, this.rules)
    chrome.runtime.sendMessage({ 'type': 'setConfig', 'config': this.rules})
  },

  switchReadMode: function switchReadMode() {
    this.rules.readModeOn = !this.rules.readModeOn
    if (this.rules.readModeOn) {
      this.applyRules(this.rules['readRules'])
    } else {
      this.removeRules(this.rules['readRules'])
    }
    chrome.runtime.sendMessage({ 'type': 'setConfig', 'config': this.rules})
  },

  applyRules: function applyRules(rules) {
    Object.keys(rules).forEach(key => {
      let rule = rules[key]
      if (rule.hasOwnProperty('element') && rule['element'] !== null && rule['element'] !== undefined)
      {
        if (rule.operation === 'Delete') {
          rule.defaultStyle = rule.element.style.display
          // rule.element.style.display = 'none'
          rule.element.setAttribute('style', 'display:none !important')
        } else {
          rule.defaultStyle = rule.element.style.visibility
          rule.element.style.visibility = 'hidden'
        }
      }
    })
  },

  removeRules: function removeRules(rules) {
    Object.keys(rules).forEach(key => {
      let rule = rules[key]
      if (rule.hasOwnProperty('element') && rule['element'] !== null && rule['element'] !== undefined) {
        if (rule.operation === 'Delete') {
          rule.element.style.display = rule.defaultStyle
        } else {
          rule.element.style.visibility = rule.defaultStyle
        }
      }
    })
  },

  addNewRule: function saveNewRule(ruleType, rule) {
    let id = Math.max.apply(this, Object.keys(this.rules[ruleType]))
    id = (id < 0) ? 0 : id+1

    this.rules[ruleType][id] = rule
    this.rules[ruleType][id].element = ObjectMaster.findElement(rule.obj)

    let modeTypeOn = (ruleType === 'cleanRules') ? 'cleanModeOn' : 'readModeOn'

    if (this.rules[modeTypeOn]) {
      let tmp = {}
      tmp[id] = this.rules[ruleType][id]
      this.applyRules(tmp)
    }

    RuleManager.setRules(this.domain, this.rules)
  },

  deleteRule: function deleteRule(type, id) {
    if (type === 'cleanRules') {
      if (this.rules.cleanRules.hasOwnProperty(id)) {
        let rule = {}
        rule[id] = this.rules.cleanRules[id]
        this.removeRules(rule)
        delete this.rules.cleanRules[id]
      }
    }
    else if(type === 'readRules') {
      if (this.rules.readRules.hasOwnProperty(id)) {
        let rule = {}
        rule[id] = this.rules.readRules[id]
        this.removeRules(rule)
        delete this.rules.readRules[id]
      }
    } else {
      return
    }
    RuleManager.setRules(this.domain, this.rules)
    chrome.runtime.sendMessage({ 'type': 'setConfig', 'config': this.rules})
  },
}
domManipulator.initRules()


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch(message.type) {
    case "hideNewElement":
      if (message.ruleType === "readRules" && !domManipulator.rules.readModeOn) {
        domManipulator.switchReadMode()
      }
      DomProbe.startProbing(message.ruleType)
      chrome.runtime.sendMessage({ 'type': 'iframeMsg', 'iframe-type': 'start' })
      sendResponse()
      break

    case "interruptProbe":
      DomProbe.stopProbing();
      break
  }
})

export function passRule(ruleType, rule) {
  domManipulator.addNewRule(ruleType, rule)
}

function addIframe() {
  let dialogUrl = chrome.runtime.getURL("pages/dialog.html")
  let iframeContainer = document.createElement('div')
  iframeContainer.innerHTML = '<iframe src="' + dialogUrl + '" scrolling="no" frameborder="0"  height="220"' +
    ' width="180"></iframe>'
  iframeContainer.id = 'purifyExtIframeContainer'
  iframeContainer.style.pointerEvents = 'none'
  iframeContainer.style.position = 'fixed'
  iframeContainer.style.top = '5px'
  iframeContainer.style.right = '10px'
  iframeContainer.style.zIndex = '99999'
  document.body.appendChild(iframeContainer)
}
//
