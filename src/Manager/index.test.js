const getUuid = require('uuid-by-string');

const { Member, Provider } = require('@ellementul/uee')
const { startEvent, timeEvent } = require('@ellementul/ueetimeticker')
const { Manager } = require('./index')

const updateListEvent = require('../events/update_list_event')
const addTaskEvent = require('../events/add_task_event')


const generateUuid = (function () {
  let genUuid = "11111111-0000-0000-0000-000000000000"
  return () => {
    genUuid = getUuid(genUuid)
    return genUuid
  }
})()

describe('Manager', () => {
  test('Constructor', () => {
    expect(() => {
      new Manager({ roles: "empty" })
    }).toThrowError("roles");

    expect(() => {
      new Manager({ roles: [{ role: "const" }] })
    }).toThrowError("member constructor");

    const manager = new Manager({
      roles: [
        {
          role: "TestRole",
          memberConstructor: Member
        }
      ]
    })
    expect(manager).toBeDefined();
  });

  test('start manager without provider', () => {
    const manager = new Manager({
      roles: [
        {
          role: "Ticker",
          memberConstructor: Member
        }
      ]
    })

    expect(() => {
      manager.start()
    }).toThrowError("provider");
  });

  test('start manager with tiker role', () => {
    const fakeUuid = "fee40a3b-9812-45ec-a929-6bfe9ec2837d"
    const provider = new Provider
    const manager = new Manager({
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

    manager.setProvider(provider)
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

    manager.setProvider(provider)
    manager.start()
    manager.send(timeEvent)

    expect(callback).toHaveBeenCalledWith({
      system: "Management",
      entity: "Task",
      state: "Added",
      action: "CreateMember",
      role: "Member",
      manager: manager.uuid
    });
  });
});

describe('Two mangers', () => {
  test('run assistant', () => {
    const fakeUuid = "fee40a3b-9812-45ec-a929-6bfe9ec2837d"
    const roles = [
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

    const provider = new Provider
    const manager = new Manager({ roles })
    const assistant = new Manager({ roles })

    const startTickerCallback = jest.fn()
    provider.onEvent(startEvent, startTickerCallback)

    manager.setProvider(provider)
    assistant.setProvider(provider)
    manager.start()
    assistant.start(true)
    manager.send(timeEvent)

    const updateListCallback = jest.fn()
    provider.onEvent(updateListEvent, updateListCallback)

    manager.send(timeEvent)

    expect(updateListCallback).toHaveBeenCalledTimes(2);
    expect(updateListCallback).toHaveBeenCalledWith({
      system: "Cooperation",
      entity: "MembersList",
      state: "Updated",
      roles: {
        Manager: {
          managers: {},
          statuses: {
            [manager.uuid]: "Connected",
            [assistant.uuid]: "Connected",
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

  test('running single member', () => {
    const fakeTickerUuid = "fee40a3b-9812-45ec-a929-6bfe9ec2837d"
    const roles = [
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
            this._uuid = generateUuid()
            this.role = "Member"
          }
        }
      }
    ]

    const provider = new Provider
    provider.setLogging(({ message }) => console.log(message))
    const manager = new Manager({ roles })
    const assistant = new Manager({ roles })

    manager.setProvider(provider)
    assistant.setProvider(provider)
    manager.start()
    assistant.start(true)
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
            [assistant.uuid]: "Connected",
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
            "f0399e9e-4527-5f29-a765-a337f4a365c0": manager.uuid
          },
          statuses: {
            "f0399e9e-4527-5f29-a765-a337f4a365c0": "Connected",
          },
        }
      },
      time: {},
    });
  });

  test('running local member', () => {
    const fakeTickerUuid = "fee40a3b-9812-45ec-a929-6bfe9ec2837d"
    const roles = [
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
            this._uuid = generateUuid()
            this.role = "Member"
          }
        },
        local: true
      }
    ]

    const provider = new Provider
    const manager = new Manager({ roles })
    const assistant = new Manager({ roles })

    manager.setProvider(provider)
    assistant.setProvider(provider)
    manager.start()
    assistant.start(true)
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
            [assistant.uuid]: "Connected",
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
            "b4d2bbfd-2bd4-578f-b7a5-3cbfa2055c0e": manager.uuid,
            "28a30282-0ae0-5653-95cd-26b9daeb7fc8": assistant.uuid
          },
          statuses: {
            "b4d2bbfd-2bd4-578f-b7a5-3cbfa2055c0e": "Connected",
            "28a30282-0ae0-5653-95cd-26b9daeb7fc8": "Connected"
          },
        }
      },
      time: {},
    });
  });
});