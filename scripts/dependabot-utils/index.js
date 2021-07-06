'use strict'

const Commander = require('commander').program

Commander.option('-t, --title <title>', 'PR Title')

Commander.command('pkg').action(() => print(extractPackage(Commander.opts().title)))
Commander.command('from').action(() => print(extractFromVersion(Commander.opts().title)))
Commander.command('to').action(() => print(extractToVersion(Commander.opts().title)))
Commander.command('type-and-scope').action(() => print(extractCommitTypeAndScope(Commander.opts().title)))

const extractPackage = title => title.substring(title.indexOf(': bump ') + 7, title.indexOf(' from ')).trim()
const extractFromVersion = title => title.substring(title.indexOf(' from ') + 5, title.indexOf(' to ')).trim()
const extractToVersion = title => title.substring(title.indexOf(' to ') + 3, title.length).trim()
const extractCommitTypeAndScope = title => title.substring(0, title.indexOf('):') + 1).trim()

const print = value => {
  process.stdout.write(value)
}

Commander.parse(process.argv)
