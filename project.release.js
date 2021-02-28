#!/usr/bin/env node

/* eslint-disable */

'use strict'

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
  .action(async (options) => {
    Logger.info('--> Publishing Packages')

    const criteria = 'pkgs/**/package.json'
    const pkgRefs = await Globby(criteria, {
      cwd: process.cwd(),
      absolute: true,
      ignore: ['**/node_modules/**', '**/out/**']
    })

    for (const pkgRef of pkgRefs) {
      const pkg = require(pkgRef)
      const pkgPath = pkgRef.replace('/package.json', '')

      Logger.info('Package: ' + pkg.name)
      Logger.info('Path: ' + pkgPath)

      execSync(`npm publish --tag=${options.tag} --dry-run`, { cwd: pkgPath })

      Logger.info(`Package "${pkg.name}" published!\n`)
    }

    Logger.info('<-- Packages Published')
  })

async function run() {
  await program.parseAsync(argv)
}

(async () => await run())()
