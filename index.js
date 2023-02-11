module.exports = {
  ...require('./src/Manager'),
  events: {
    addTask: require('./src/events/add_task_event'),
    updateList: require('./src/events/update_list_event'),
    readyMembers: require('./src/events/all_members_ready_event')
  }
}