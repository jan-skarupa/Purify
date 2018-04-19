'use strict'

const messagePrototype = {
  getType: function getType() {
    return this.type
  }
}

const messageFactory = {

  create: {
    getConfig: function getConfig(whip) {
      return Object.assign(Object.create(null), {messagePrototype, whip})
    }
  },

  types: Object.freeze({
    getDomainRules: 'getDomainRules',
    getConfig: 'getConfig',
    updateConfig: 'updateConfig'
  }),
}

export default messageFactory
