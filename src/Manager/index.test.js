const { Member } = require('uee')
const { Manager } = require('./index')
const { Ticker } = require('@ellementul/ueetimeticker')


describe('Manager', () => {
  test('Constructor', () => {
    const roles = [
      {
        role: "TestRole",
        memberConstructor: Member
      }
    ]

    expect(() => {
      new Manager({ roles: "empty" })
    }).toThrowError("roles");

    expect(() => {
      new Manager({ roles: [{ role: "const" }] })
    }).toThrowError("member constructor");

    const manager = new Manager({ roles })
    expect(manager).toBeDefined();
  });

  test('start manager without tiker role', () => {
    const manager = new Manager({ 
      roles: [
        {
          role: "TestRole",
          memberConstructor: Member
        }
      ]
    })

    expect(() => {
      manager.start()
    }).toThrowError("ticker");
  });

  test('start manager with tiker role', () => {
    const manager = new Manager({ 
      roles: [
        {
          role: "Ticker",
          memberConstructor: Ticker
        }
      ]
    })

    manager.start();
  });

  test('getting role', () => {
    class TestMember extends Member {
      role = "TestRole"
    }

    const roles = [
      {
        role: "TestRole",
        memberConstructor: Member
      }
    ]
    const manager = new Manager({ roles })
    const member = new Member
    const testMember = new TestMember

    expect(manager.getRole(manager)).toBe("Manager")
    expect(manager.getRole(member)).toBe("Member")
    expect(manager.getRole(testMember)).toBe("TestRole")
  });
});