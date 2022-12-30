const { 
  Member, 
  Provider, 
  events: { 
    connect: connectMemberEvent,
    change: changeMemberEvent
  } } = require('@ellementul/uee')
const { startEvent, timeEvent } = require('@ellementul/ueetimeticker')
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

    const manager = new Manager({ 
      provider: new Provider,
      roles: [
        {
          role: "TestRole",
          memberConstructor: Member
        }
      ]
    })
    expect(manager).toBeDefined();
  });

  test('start manager with tiker role', () => {
    const fakeUuid = "fee40a3b-9812-45ec-a929-6bfe9ec2837d"
    const provider = new Provider
    const manager = new Manager({
      provider,
      roles: [
        {
          role: "Ticker",
          memberConstructor: class fakeTicker extends Member {
            constructor(){
              super()
              this._uuid = fakeUuid
              this.role = "Ticker"
            }
          }
        }
      ]
    })
    const startTickerCallback = jest.fn()
    provider.onEvent(startEvent, startTickerCallback)

    manager.start();

    const updateListCallback = jest.fn()
    provider.onEvent(updateListEvent, updateListCallback)
    
    manager.send(timeEvent)
    
    expect(updateListCallback).toHaveBeenCalledWith({
      system: "Cooperation",
      entity: "MembersList",
      state: "Updated",
      roles: {
        Manager: {
          managers: {},
          statuses: {
            [manager.uuid]: "Connected",
          },
        },
        Ticker: {
          managers: {
            [fakeUuid]: manager.uuid,
          },
          statuses: {
            [fakeUuid]: "Connected",
          },
        }
      },
      time: {},
    });
  });

  test('add task event', () => {
    const provider = new Provider
    const manager = new Manager({
      provider,
      roles: [
        {
          role: "Ticker",
          memberConstructor: class fakeTicker extends Member {
            constructor(){
              super()
              this.role = "Ticker"
            }
          }
        },
        {
          role: "Member",
          memberConstructor: Member
        }
      ]
    })

    const callback = jest.fn()
    manager.onEvent(addTaskEvent, callback)

    manager.start()
    manager.send(timeEvent)

    expect(callback).toHaveBeenCalledWith({
      system: "Management",
      entity: "Task",
      state: "Added",
      action: "CreateMember",
      role: "Member"
    });
  });

  test('running local member', () => {
    const fakeTickerUuid = "fee40a3b-9812-45ec-a929-6bfe9ec2837d"
    const fakeMemberUuid = "11111111-9812-45ec-a929-6bfe9ec2837d"
    const provider = new Provider
    provider.setLogging(({ message }) => console.log(message))
    const manager = new Manager({
      provider,
      roles: [
        {
          role: "Ticker",
          memberConstructor: class fakeTicker extends Member {
            constructor(){
              super()
              this._uuid = fakeTickerUuid
              this.role = "Ticker"
            }
          }
        },
        {
          role: "Member",
          memberConstructor: class fakeMember extends Member {
            constructor(){
              super()
              this._uuid = fakeMemberUuid
              this.role = "Member"
            }
          }
        }
      ]
    })

    manager.start()
    manager.send(timeEvent)

    const updateListCallback = jest.fn()
    provider.onEvent(updateListEvent, updateListCallback)

    manager.send(timeEvent)

    expect(updateListCallback).toHaveBeenCalledWith({
      system: "Cooperation",
      entity: "MembersList",
      state: "Updated",
      roles: {
        Manager: {
          managers: {},
          statuses: {
            [manager.uuid]: "Connected",
          },
        },
        Ticker: {
          managers: {
            [fakeTickerUuid]: manager.uuid,
          },
          statuses: {
            [fakeTickerUuid]: "Connected",
          },
        },
        Member: {
          managers: {
            [fakeMemberUuid]: manager.uuid,
          },
          statuses: {
            [fakeMemberUuid]: "Connected",
          },
        }
      },
      time: {},
    });
  });
});