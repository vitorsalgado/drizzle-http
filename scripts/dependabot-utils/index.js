'use strict'

const Cmd = require('commander').program

Cmd.command('pkg').action(() => print(extractPackage(priorCommit())))
Cmd.command('from').action(() => print(extractFromVersion(priorCommit())))
Cmd.command('to').action(() => print(extractToVersion(priorCommit())))
Cmd.command('type').action(() => print(extractCommitTypeAndScope(priorCommit())))

const extractPackage = title => title.substring(title.indexOf(': bump ') + 7, title.indexOf(' from ')).trim()
const extractFromVersion = title => title.substring(title.indexOf(' from ') + 5, title.indexOf(' to ')).trim()
const extractToVersion = title => title.substring(title.indexOf(' to ') + 3, title.length).trim()
const extractCommitTypeAndScope = title => title.substring(0, title.indexOf('):') + 1).trim()

const print = value => {
  process.stdout.write(value)
}

const priorCommit = () => process.env.GIT_PRIOR_COMMIT

Cmd.parse(process.argv)
