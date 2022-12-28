const { Member, Provider } = require('@ellementul/uee')
const { Ticker } = require('@ellementul/ueetimeticker')
const { Manager } = require('./index')

const updateListEvent = require('../events/update_list_event')
const addTaskEvent = require('../events/add_task_event')

describe('Manager', () => {
  test('Constructor', () => {
    expect(() => {
      new Manager({ roles: "empty" })
    }).toThrowError("roles");

    expect(() => {
      new Manager({ roles: [{ role: "const" }] })
    }).toThrowError("member constructor");

    expect(() => {
      new Manager({ 
        provider: new Provider,
        roles: [
          {
            role: "TestRole",
            memberConstructor: Member
          }
        ]
      })
    }).toThrowError("ticker");

    const manager = new Manager({ 
      provider: new Provider,
      roles: [
        {
          role: "Ticker",
          memberConstructor: Ticker
        }
      ]
    })
    expect(manager).toBeDefined();
  });

  test('start manager with tiker role', () => {
    jest.useFakeTimers();
    const provider = new Provider
    const manager = new Manager({
      provider,
      roles: [
        {
          role: "Ticker",
          memberConstructor: Ticker
        }
      ]
    })

    const callback = jest.fn()
    manager.onEvent(updateListEvent, callback)

    manager.start();
    jest.runOnlyPendingTimers();
    
    expect(callback).toHaveBeenCalledWith({
      system: "Cooperation",
      entity: "MembersList",
      state: "Updated",
      roles: {
        Manager: {
          instances: {
            [manager.uuid]: "Connected",
          },
        },
        Ticker: {
          instances: {
            [manager.tickerUuid]: "Connected",
          },
        }
      },
      time: {},
    });

  });

  test('add task event', () => {
    jest.useFakeTimers();
    const provider = new Provider
    const manager = new Manager({
      provider,
      roles: [
        {
          role: "Ticker",
          memberConstructor: Ticker
        },
        {
          role: "LocalMember",
          memberConstructor: (class LocalMember extends Member {})
        }
      ]
    })

    const callback = jest.fn()
    manager.onEvent(addTaskEvent, callback)

    manager.start();
    jest.runOnlyPendingTimers();
    
    expect(callback).toHaveBeenCalledWith({
      system: "Management",
      entity: "Task",
      state: "Added",
      action: "CreateMemeber",
      role: "LocalMember"
    });
  });

  test('running local member', () => {
    jest.useFakeTimers();
    const provider = new Provider
    const manager = new Manager({
      provider,
      roles: [
        {
          role: "Ticker",
          memberConstructor: Ticker
        },
        {
          role: "LocalMember",
          memberConstructor: (class LocalMember extends Member {})
        }
      ]
    })

    const callback = jest.fn()
    manager.onEvent(addTaskEvent, callback)

    manager.start();
    jest.runOnlyPendingTimers();
    
    expect(callback).toHaveBeenCalledWith({
      system: "Management",
      entity: "Task",
      state: "Added",
      action: "CreateMemeber",
      role: "LocalMember"
    });
  });
});