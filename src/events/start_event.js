const { EventFactory, Types } = require('uee')
const type = Types.Object.Def({
  system: "Timing",
  entity: "Ticker",
  action: "Start"
})
module.exports = EventFactory(type)