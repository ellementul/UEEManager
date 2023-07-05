const { Member } = require('@ellementul/uee-core')


const readyEvent = require('../events/all_members_ready_event')

class Manager extends Member {
  constructor({ roles }) {
    super()

    this.role = "Manager"

    if (!Array.isArray(roles) || roles.length < 1)
      throw new TypeError("The roles canot be empty!")

    if (
      roles.some(
        (memberConstructor) => {
          if(typeof memberConstructor === "object")
            memberConstructor = memberConstructor.memberConstructor
          
          return typeof memberConstructor !==  "function"
        }
      )
    ) throw TypeError("A member constructor isn't function!")

    this._roles = roles
    this._members = {
      [this.getRole()]: {
        memberConstructor: Manager,
        managers: new Map,
        statuses: new Map,
        instances: new Map([[this.uuid, this]])
      }
    }
    
    this._state = "Initialized"
  }

  start() {
    if(!this._provider)
      throw new TypeError("The manger doesn't have provider!")

    this._roles.forEach((memberConstructor) => {
      let role = null
      if(typeof memberConstructor === "object") {
        role = memberConstructor.role
        memberConstructor = memberConstructor.memberConstructor
      }
      else {
        role = memberConstructor.name
      }
      
      memberConstructor.role = role
      this._members[role] = { memberConstructor }
      this.createMember({ manager: this.uuid, role })
    })
    this.send(readyEvent)
  }

  createMember({ manager, role }) {
    if(manager != this.uuid) return

    const memberConstructor = this._members[role].memberConstructor
    const member = new memberConstructor
    member.role |= memberConstructor.role
    member.setProvider(this._provider)
    this._members[role].uuid = member.uuid
    this._members[role].instance = member
    this._members[role].manager = this.uuid
    this._members[role].status = "READY"
  }

  reset() {
    for (let role in this._members) {
      if (role !== this.getRole()) {
        const instance = this._members[role].instance
        if(typeof instance.reset == "function")
            instance.reset()
      }
    }
  }
}

module.exports = { Manager }