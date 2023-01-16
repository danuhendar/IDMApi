const fs = require('fs')
const path = require('path')
const {NodeSSH} = require('node-ssh')

const ssh = new NodeSSH()
// or with inline privateKey
ssh.connect({
  host: '172.24.52.3',
  username: 'root',
  password: 'edpho@idm',
  port:22,
  readyTimeout: 200000
})
.then(function() {
  // Local, Remote
  // Putting entire directories
  const failed = []
  const successful = []
  // Command
  ssh.execCommand('systemctl restart LoginService', { cwd:'/home/idmcmd/' }).then(function(result) {
    console.log('STDOUT: ' + result.stdout)
    console.log('STDERR: ' + result.stderr)
  })
});



module.exports = NodeSSH;