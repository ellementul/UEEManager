const { Member } = require('uee')

class Manager extends Member {
  constructor({ roles }) {
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
  }

  start() {
    if(!this._roles.Ticker)
      throw new Error("The manager doesn't have ticker role!")
  }

  getRole(member) {
    console.log(member)
    return member.role || member.constructor.name
  }
}

module.exports = { Manager }