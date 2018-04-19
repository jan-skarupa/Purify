'use strict'

const ruleContentStub = {
  'home': {
    'cleanModeOn': true,
    'cleanRules': {
      0: {
        'name': 'second paragraph',
        'operation': 'Delete',
        'obj': { 'xpath': '/html/body/section[2]/div/div[1]' }
      }
    },
    'readRules': {
      1: {
        'name': 'logo',
        'operation': 'Delete',
        'obj': { 'xpath': '/html/body/header/div/div/h1/a/img' }
      }
    }
  }
}


const RuleManager = {

  initStorage: function initStorage() {
    chrome.storage.local.clear()
    Object.keys(ruleContentStub).forEach(key => {
      let newRule = {}
      newRule[key] = JSON.stringify(ruleContentStub[key])
      chrome.storage.local.set(newRule)
    })
  },

  getRules: function getRules(domain) {
    return new Promise((resolve) => {
      chrome.storage.local.get(domain, rules => {
        if (Object.keys(rules).length === 0) {
          resolve({})
        } else {
          resolve(JSON.parse(rules[domain]))
        }
      })
    })
  },

  setRules: function setRule(domain, rule) {
    let input = {}
    input[domain] = JSON.stringify(rule)
    chrome.storage.local.set(input)
  }

}

export default RuleManager
