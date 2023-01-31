module.exports = {
  ...require('./src/Manager'),
  "addTaskEvent": require('./src/events/add_task_event'),
  "updateListEvent": require('./src/events/update_list_event'),
  "readyEvent": require('./src/events/all_members_ready_event')
}