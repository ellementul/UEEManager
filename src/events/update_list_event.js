const { EventFactory, Types } = require('@ellementul/uee')
const type = Types.Object.Def({
  system: "Cooperation",
  entity: "MembersList",
  state: "Updated",
  roles: {},
  time: {}
}, true)
module.exports = EventFactory(type)