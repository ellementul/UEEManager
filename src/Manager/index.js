const { Member, events: { change: changeMemberEvent } } = require('@ellementul/uee')
const { startEvent, timeEvent } = require('@ellementul/ueetimeticker')

const updateListEvent = require('../events/update_list_event')
const createMemberEvent = require('../events/create_member_event')

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
        managers: new Map,
        statuses: new Map,
        instances: new Map([[this.uuid, this]])
      }
    }

    roles.forEach(({role, memberConstructor}) => { 
      this._roles[role] = { 
        memberConstructor,
        managers: new Map,
        statuses: new Map,
        instances: new Map
      }
    })

    this.onEvent(changeMemberEvent, payload => this.updateMembersStatus(payload))
    this.setProvider(provider)
  }

  buildTicker (Ticker) {
    const ticker = new Ticker
    
    ticker.setProvider(this._provider)

    this._roles[ticker.getRole()].instances.set(ticker.uuid, ticker)
    this._roles[ticker.getRole()].managers.set(ticker.uuid, this.uuid)
  }

  updateMembersStatus ({ state, role, uuid }) {
    if(!this._roles[role])
      throw new TypeError(`Unknowed role: ${role}!`)

    this._roles[role].statuses.set(uuid, state)
  }

  sendMembersList ({ state }) {
    const roles = {}
    for (let role in this._roles) {
      roles[role] = {
        managers: Object.fromEntries(this._roles[role].managers),
        statuses: Object.fromEntries(this._roles[role].statuses)
      }
    }
    this.send(updateListEvent, {
      roles
    })
  }

  start() {
    this.onEvent(updateListEvent, payload => {
      this.updateMembers(payload)
      this.checkMembers()
    })
    this.onEvent(createMemberEvent, payload => this.createMember(payload))
    
    if(this._roles.Ticker) {
      this.createMember({ role: "Ticker" })
      this.onEvent(timeEvent, payload => this.sendMembersList(payload))
    }

    this.send(startEvent)
  }

  updateMembers({ roles }) {
    for (let role in roles) {
      for (let uuid in roles[role].managers) {
        this._roles[role].managers.set(uuid, roles[role].managers[uuid])
      }
    }
  }

  checkMembers() {
    for (let role in this._roles) {
      const instances = this._roles[role].instances
      if (instances.size === 0) {
        this.send(createMemberEvent, {
          role
        })
      }
    }
  }

  createMember({ role }) {
    if(!this._roles[role])
      throw new TypeError(`Unknowed role: ${role}!`)

    const memberConstructor = this._roles[role].memberConstructor
    const member = new memberConstructor
    member.setProvider(this._provider)
    this._roles[role].instances.set(member.uuid, member)
    this._roles[role].managers.set(member.uuid, this.uuid)
  }

  reset() {
    for (let role in this._roles) {
      if (role !== this.getRole())
        for (let [uuid, instance] of this._roles[role].instances) {
          if(typeof instance.reset == "function")
            instance.reset()
        }
    }
  }
}

module.exports = { Manager }