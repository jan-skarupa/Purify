let probing = false

chrome.runtime.onMessage.addListener((message) => {
  switch (message['iframe-type']) {
    case "start":
      probing = true
      document.getElementById('rule-name').value = ''
      document.getElementById('selection').style.display = 'block'
      break

    case "expandSelectionMenu":
      expandMenu()
      break

    case "stop":
      probing = false
      document.getElementById('selection').style.display = 'none'
      document.getElementById('adjustment').style.display = 'none'
      break
  }
})

document.onkeydown = (event) => {
  if (probing && (event.key === 'Escape' || event.key === 'Esc')) {
    probing = false
    document.getElementById('selection').style.display = 'none'
    document.getElementById('adjustment').style.display = 'none'
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {'type': 'domSniffMsg', 'iframe-type': 'stop'})
    })
  }
}

function expandMenu() {
  document.body.style.pointerEvents = 'auto'
  document.getElementById('selection').style.display = 'none'
  document.getElementById('adjustment').style.display = 'block'

  document.getElementById('expsel').addEventListener('click', () => {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {'type': 'domSniffMsg', 'iframe-type': 'expand'})
    })
  })

  document.getElementById('shrsel').addEventListener('click', () => {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {'type': 'domSniffMsg', 'iframe-type': 'shrink'})
    })
  })

  document.getElementById('save-btn').addEventListener('click', () => {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
      let name = document.getElementById('rule-name').value
      let operation = (document.getElementById('keep-space').checked) ? 'Hide' : 'Delete'
      document.getElementById('adjustment').style.display = 'none'

      chrome.tabs.sendMessage(tabs[0].id, {'type': 'domSniffMsg', 'iframe-type': 'save-rule', 'name': name, 'operation': operation})
    })
  })

}

