#!/usr/bin/env node

/* eslint-disable */

'use strict'

const Path = require('path')
const FsExt = require('fs-extra')
const Pino = require('pino')
const Globby = require('globby')
const { execSync } = require('child_process')
const { program } = require('commander')

const argv = process.argv
if (argv.length <= 2) argv.push('--help')

const Logger = Pino({
  level: 'info',
  prettyPrint: {
    colorize: true,
    messageFormat: '{msg}',
    translateTime: true,
    ignore: 'hostname'
  }
})

program
  .command('publish')
  .description('Publishes all packages to NPM')
  .option('-t, --tag <tag>', 'Tag', 'latest')
  .action(async options => {
    Logger.info('--> Publishing Packages\n')

    const criteria = 'pkgs/**/package.json'
    const pkgRefs = await Globby(criteria, {
      cwd: process.cwd(),
      absolute: true,
      ignore: ['**/node_modules/**', '**/out/**', '**/temp/**']
    })

    Logger.info('Context:')
    Logger.info('Pwd: ' + process.cwd())

    for (const pkgRef of pkgRefs) {
      const pkg = require(pkgRef)
      const pkgPath = pkgRef.replace('/package.json', '')

      Logger.info('Package: ' + pkg.name)
      Logger.info('Path: ' + pkgPath)

      FsExt.copySync(Path.join(process.cwd(), 'LICENSE'), Path.join(pkgPath, 'LICENSE'))

      execSync(`npm publish --access public --tag=${options.tag}`, { cwd: pkgPath })

      Logger.info('Removing temporary release files')
      FsExt.removeSync(Path.join(pkgPath, 'LICENSE'))

      Logger.info(`Package "${pkg.name}" published!\n`)
    }

    Logger.info('<-- Packages Published')
  })

async function run() {
  await program.parseAsync(argv)
}

run().catch(Logger.error)
