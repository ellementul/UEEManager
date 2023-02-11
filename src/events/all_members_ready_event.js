const { EventFactory, Types } = require('@ellementul/uee-core')
const type = Types.Object.Def({
  system: "Cooperation",
  entity: "AllMembers",
  state: "Ready"
}, true)
module.exports = EventFactory(type)