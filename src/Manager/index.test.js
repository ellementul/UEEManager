const { Member, Provider, EventFactory, Types } = require('uee')
const { Manager } = require('./index')
const { Ticker } = require('@ellementul/ueetimeticker')


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
    provider.setLogging(console.log)
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
    manager.onEvent(require('../events/time_event'), callback)

    manager.start();
    jest.runOnlyPendingTimers();
    expect(callback).toHaveBeenCalled();
  });

  test('getting role', () => {
    class TestMember extends Member {
      role = "TestRole"
    }

    const roles = [
      {
        role: "Ticker",
        memberConstructor: Ticker
      }
    ]
    const provider = new Provider
    const manager = new Manager({ provider, roles })
    const member = new Member
    const testMember = new TestMember

    expect(manager.getRole(manager)).toBe("Manager")
    expect(manager.getRole(member)).toBe("Member")
    expect(manager.getRole(testMember)).toBe("TestRole")
  });
});