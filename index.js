var PouchDB = require('pouchdb')
var uuid = require('uuid')
var intersection = require('lodash.intersection')

module.exports = function (ee, model, roles) {
  var db = new PouchDB(model, { db: require('memdown')})

  ee.on(model, function (event) {
    var rid = uuid.v4()
    var jwtResponded = false

    ee.on(rid, function (jwt) {
      if (jwtResponded) { return }
      jwtResponded = true
      // has jwt tokent and confirm if user is in allowable roles
      if (!jwt.object.meta ||
        (roles.length !== 0 &&
        intersection(roles, event.actor.roles).length === 0)) {
        // access denied
        respondError({ message: 'Access Denied'})
        return
      }
      // HANDLE CREATE OR UPDATE
      if (['create', 'update'].indexOf(event.verb) > -1) {
        db.put(event.object).then(respond).catch(respondError)
        return
      }
      // HANDLE READ
      if (event.verb === 'get') {
        db.get(event.object).then(respond).catch(respondError)
        return
      }
      // HANDLE DESTROY
      if (event.verb === 'remove') {
        db.remove(event.object).then(respond).catch(respondError)
        return
      }
      // HANDLE LIST
      if (event.verb === 'list') {
        var options = event.object.options
        db.allDocs(options).then(respond).catch(respondError)
        return
      }
    })

    // if can't find jwt service then timeout in 5 secs
    setTimeout(function () {
      if (jwtResponded) { return }
      jwtResponded = true
      respondError({ message: 'jwt service not available'})
    }, 5000)

    //console.log(event)
    // authenticate
    ee.emit('send', {
      to: 'jwt',
      from: rid,
      subject: 'jwt',
      object: {
        id: event.actor.jwt
      },
      date: (new Date())
    })

    // basic respond
    function respond (data) {
      console.log(data)
      ee.emit('send', {
        to: event.from,
        from: model,
        subject: model,
        verb: 'response',
        object: data,
        date: (new Date())
      })
    }

    function respondError (err) {
      ee.emit('send', {
        to: event.from,
        from: model,
        subject: model,
        verb: 'error',
        object: err,
        date: (new Date())
      })
    }
  })
}
