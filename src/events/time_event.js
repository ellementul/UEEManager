const { EventFactory, Types } = require('uee')
const { LIMIT } = require('@ellementul/timecount')
const type = Types.Object.Def({
  system: "Timing",
  entity: "Time",
  state: {
    timemark: [Types.Index.Def(LIMIT), Types.Index.Def(LIMIT)]
  }
}, true)
module.exports = EventFactory(type)