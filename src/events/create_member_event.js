const { EventFactory, Types } = require('@ellementul/uee-core')
const type = Types.Object.Def({
  system: "Management",
  entity: "Task",
  state: "Added",
  action: "CreateMember",
  role: Types.Key.Def()
}, true)
module.exports = EventFactory(type)