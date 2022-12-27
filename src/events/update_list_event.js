const { EventFactory, Types } = require('@ellementul/uee')
const type = Types.Object.Def({
  system: "Cooperation",
  entity: "MembersList"
})
module.exports = EventFactory(type)