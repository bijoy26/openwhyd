var fs = require('fs');
var async = require('async');

var DB_INIT_SCRIPTS = [
  './config/initdb.js',
  './config/initdb_testing.js' // creates an admin user => should not be run on production!
];

var params = (process.appParams = {
  mongoDbHost: process.env['MONGODB_HOST'].substr(),
  mongoDbPort: process.env['MONGODB_PORT'].substr(), // 27017
  mongoDbAuthUser: process.env['MONGODB_USER'],
  mongoDbAuthPassword: process.env['MONGODB_PASS'],
  mongoDbDatabase: 'openwhyd_test' //process.env['MONGODB_DATABASE'],
});

console.log('[test-db-init.js] Connecting to db ...');
require('../app/models/mongodb.js').init(function(err, db) {
  if (err) throw err;
  var mongodb = this;
  console.log('[test-db-init.js] Clearing test database ...');
  db.dropDatabase(function(err) {
    if (err) throw err;
    async.eachSeries(
      DB_INIT_SCRIPTS,
      function(initScript, nextScript) {
        console.log(
          '[test-db-init.js] Applying db init script:',
          initScript,
          '...'
        );
        mongodb.runShellScript(fs.readFileSync(initScript), nextScript);
      },
      function(err, res) {
        if (err) throw err;
        console.log('[test-db-init.js] => done.');
        process.exit();
      }
    );
  });
});
