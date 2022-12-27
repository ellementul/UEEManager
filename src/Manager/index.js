const { Member } = require('uee')
const startEvent = require('../events/start_event')

class Manager extends Member {
  constructor({ provider, roles }) {
    super()

    if (!Array.isArray(roles) || roles.length < 1)
      throw new TypeError("The roles canot be empty!")

    if (
      roles.some(
        ({role, memberConstructor}) => typeof memberConstructor !==  "function"
      )
    ) throw TypeError("A member constructor isn't function!")

    this._roles = {}
    roles.forEach(({role, memberConstructor}) => { 
      this._roles[role] = { memberConstructor }
    })

    this.setProvider(provider)

    if(!this._roles.Ticker)
      throw new Error("The manager doesn't have ticker role!")
    else
      this.buildTicker(this._roles.Ticker.memberConstructor, provider)
  }

  buildTicker (Ticker, provider) {
    const ticker = new Ticker
    ticker.setProvider(provider)
  }

  start() {
    this.send(startEvent)
  }

  getRole(member) {
    return member.role || member.constructor.name
  }
}

module.exports = { Manager }