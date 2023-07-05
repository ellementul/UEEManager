const getUuid = require('uuid-by-string');

const { Member, Provider } = require('@ellementul/uee-core')
const { Manager } = require('./index')

const readyEvent = require('../events/all_members_ready_event')


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

  test('start manager without role', () => {
    const fakeUuid = "fee40a3b-9812-45ec-a929-6bfe9ec2837d"
    const provider = new Provider
    const manager = new Manager({
      roles: [
        class fakeTicker extends Member {
          constructor(){
            super()
            this._uuid = fakeUuid
            this.role = "Ticker"
          }
        }
      ]
    })

    manager.setProvider(provider)
    
    const readyCallback = jest.fn()
    provider.onEvent(readyEvent, readyCallback)

    manager.start();
    
    expect(readyCallback).toHaveBeenCalledTimes(1)
  });

  test('start manager with role', () => {
    const fakeUuid = "fee40a3b-9812-45ec-a929-6bfe9ec2837d"
    const provider = new Provider
    const manager = new Manager({
      roles: [
        {
          role: "Ticker",
          memberConstructor: class SomethingMember extends Member {
            constructor(){
              super()
              this._uuid = fakeUuid
              this.role = "Ticker"
            }
          }
        }
      ]
    })

    manager.setProvider(provider)
    
    const readyCallback = jest.fn()
    provider.onEvent(readyEvent, readyCallback)

    manager.start();
    
    expect(readyCallback).toHaveBeenCalledTimes(1)
  });
});
