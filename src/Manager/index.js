const { Member, events: { change: changeMemberEvent } } = require('@ellementul/uee')
const { startEvent, timeEvent } = require('@ellementul/ueetimeticker')
const updateListEvent = require('../events/update_list_event')

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

    this._roles = {
      [this.getRole()]: {
        memberConstructor: Manager,
        instances: new Map
      }
    }

    roles.forEach(({role, memberConstructor}) => { 
      this._roles[role] = { 
        memberConstructor,
        instances: new Map
      }
    })

    this.onEvent(changeMemberEvent, payload => this.updateMembersStatus(payload))
    this.setProvider(provider)

    if(!this._roles.Ticker)
      throw new Error("The manager doesn't have ticker role!")
    else
      this.tickerUuid = this.buildTicker(this._roles.Ticker.memberConstructor)
  }

  buildTicker (Ticker) {
    const ticker = new Ticker
    this.onEvent(timeEvent, payload => this.updateMembersList(payload))
    ticker.setProvider(this._provider)

    return ticker.uuid
  }

  updateMembersStatus ({ state, role, uuid }) {
    if(!this._roles[role])
      throw new TypeError(`Unknowed role: ${role}!`)

    this._roles[role].instances.set(uuid, state)
  }

  updateMembersList ({ state }) {
    const roles = {}
    for (let role in this._roles) {
      roles[role] = {
        instances: Object.fromEntries(this._roles[role].instances)
      }
    }
    this.send(updateListEvent, {
      roles
    })
  }

  start() {
    this.send(startEvent)
  }
}

module.exports = { Manager }