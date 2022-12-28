const { EventFactory, Types } = require('@ellementul/uee')
const type = Types.Object.Def({
  system: "Management",
  entity: "Task",
  state: "Added",
  action: Types.Key.Def()
}, true)
module.exports = EventFactory(type)