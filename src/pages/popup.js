'use strict'

chrome.runtime.onMessage.addListener(message => {
  if (message.type === "setConfig") {
    configUpdate(message.config)
  }
})
sendMessage({ type: "interruptProbe" })
sendMessage({ type: "getConfig" })


function configUpdate(config) {

  document.getElementById('clean-mode-btn').checked = config.cleanModeOn
  document.getElementById('read-mode-btn').checked  = config.readModeOn

  let rulesHtml = ''
  Object.keys(config.cleanRules).forEach(key => {
    let rule = config.cleanRules[key]
    rulesHtml += generateRuleHtml('deleteClean', key, rule['operation'], rule['name'], rule['obj']['xpath'])
  })
  if (rulesHtml === '') {
    rulesHtml = '<div class="rule"><div class="noRules"><h6>No ReadMode rules for this domain.</h6></div></div>'
  }
  document.getElementById('clean-rules-list').innerHTML = rulesHtml

  rulesHtml = ''
  Object.keys(config.readRules).forEach(key => {
    let rule = config.readRules[key]
    rulesHtml += generateRuleHtml('deleteRead', key, rule['operation'], rule['name'], rule['obj']['xpath'])
  })
  if (rulesHtml === '') {
    rulesHtml = '<div class="rule"><div class="noRules"><h6>No ReadMode rules for this domain.</h6></div></div>'
  }
  document.getElementById('read-rules-list').innerHTML = rulesHtml


  Array.from(document.getElementsByClassName('deleteClean')).forEach(function(elem) {
    let key = elem.id.split('-')[1]
    elem.addEventListener('click', function() { deleteRule('cleanRules', parseInt(key)) })
  })
  Array.from(document.getElementsByClassName('deleteRead')).forEach(function(elem) {
    let key = elem.id.split('-')[1]
    elem.addEventListener('click', function() { deleteRule('readRules', parseInt(key)) })
  })

  displayPanel()
}

function deleteRule(ruleType, id) {
  sendMessage({ 'type': 'deleteRule', 'ruleType': ruleType, 'id': id })
}

function displayPanel() {
  document.getElementById('loading-screen').style.display = 'none'
  document.getElementById('general-settings').style.display = 'block'
}


function sendMessage(message, callback) {
  getCurrentTab().then(tab => {
    chrome.tabs.sendMessage(tab.id, message, callback)
  })
}

function getCurrentTab() {
  return new Promise(resolve => {
    chrome.tabs.query({ currentWindow: true, highlighted: true }, (tabs) => {
      resolve(tabs[0])
    })
  })
}

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('clean-mode-btn').addEventListener('click', switchCleanMode)
  document.getElementById('read-mode-btn').addEventListener('click', switchReadMode)
  document.getElementById('add-clean-rule-btn').addEventListener('click', () => { hideNewElement('cleanRules') })
  document.getElementById('add-read-rule-btn').addEventListener('click', () => { hideNewElement('readRules') })
})

function switchCleanMode() {
  sendMessage({'type': "switchCleanMode"})
}

function switchReadMode() {
  sendMessage({'type': "switchReadMode"})
}

function hideNewElement(ruleType) {
  sendMessage({'type': 'turnOnCleanMode'})
  sendMessage({'type': 'hideNewElement', 'ruleType': ruleType }, () => {
    window.close()
  })
}

function generateRuleHtml(type, key, action, name, xpath) {
  return '<div class="rule">' +
    '<div>' +
    '<h6>'+key+':</h6>' +
    '</div>' +
    '<div>' +
    '<h6>'+action+' '+name+'</h6>' +
    '<h6>'+xpath+'</h6>' +
    '</div>' +
    '<div>' +
    '<img src="../icons/delete.png" class="'+type+'" id='+type+'-'+key+'>' +
    '</div>' +
    '</div>'
}
