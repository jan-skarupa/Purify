'use strict'

import RuleManager from './modules/rule-manager'
import { parseUrl } from './modules/utils'

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install' || details.reason === 'update') {
    console.log("Update Storage!!!")
    RuleManager.initStorage()
  }
})
// RuleManager.initStorage()

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'getPageRules':
      let domain = parseUrl(message.url).domain
      RuleManager.getRules(domain).then(domainRules => {
        sendResponse(domainRules)
      })
      break

    case 'iframeMsg':
      chrome.tabs.sendMessage(sender.tab.id, message)
      break
  }

  return true
})
