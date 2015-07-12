var test = require('tap').test
var EventEmitter = require('events').EventEmitter
var ee = new EventEmitter()

var uuid = require('uuid')

var model = require('../')(ee, 'widgets', [])

ee.on('send', function (e) {
  if (e.subject !== 'jwt') return
  ee.emit(e.from, {
    to: e.from,
    subject: 'jwt',
    object: {
      id: e.object.jwt,
      meta: {
        username: 'twilson63',
        roles: ['admin']
      }
    },
    date: (new Date()).toISOString()
  })
})

test('basic crud test', function (t) {
  var uid = uuid.v4()
  ee.on('send', function (e) {
    if (e.to === uid) {
      t.ok(e.object.ok)
      t.end()
    }
  })

  ee.emit('widgets', {
    to: 'widgets',
    from: uid,
    subject: 'widgets',
    verb: 'create',
    object: {
      _id: 'foo',
      name: 'beep',
      description: 'A description about beep'
    },
    actor: {
      jwt: '1234'
    }
  })
})
