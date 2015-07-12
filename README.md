# Palmetto model

Model is a basic palmetto service that uses memdown and pouchdb as its datastore.

## Usage

To create a model service, you want to make sure you have your jwt service setup.

** Disclaimer

See palmetto-jwt, if you don't need authentication, then use an anonymous palmetto
service.

### Compose to firebase adapter and setup as widgets model

``` js
var palmetto = require('@twilson63/palmetto-fire')
var ee = palmetto(config.get('firebase'))
require('@twilson63/palmetto-model')(ee, 'widgets', [])
require('health-server')

// init/replay log for widget data here
```

This server composes the firebase adapter and the model to create a data service
for widgets. This service uses pouchdb and memdown an in memory database, so when
you restart the service you want to replay the log from the commit-log, in this
example firebase.
