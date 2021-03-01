#!/usr/bin/env node

/* eslint-disable */

'use strict'

const Path = require('path')
const FsExt = require('fs-extra')
const Pino = require('pino')
const Globby = require('globby')
const PkgMain = require('../../package.json')
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

    const changed = JSON.parse(execSync('lerna changed --json').toString())
    const criteria = 'pkgs/**/package.json'
    const pkgRefs = await Globby(criteria, {
      cwd: process.cwd(),
      absolute: true,
      ignore: ['**/node_modules/**', '**/out/**', '**/temp/**']
    })

    Logger.info('Context:')
    Logger.info('Pwd: ' + process.cwd())
    Logger.info('Changed Packages: ' + changed.map(x => x.name).join(', '))
    Logger.info('Total Changed Packages: ' + changed.length.toString() + '\n')

    for (const pkgRef of pkgRefs) {
      const pkg = require(pkgRef)
      const pkgPath = pkgRef.replace('/package.json', '')

      if (!changed.some(x => x.name !== pkg.name)) {
        Logger.info(`Package "${pkg.name}" has no changes to publish. Skipping.\n`)
        continue
      }

      Logger.info('Package: ' + pkg.name)
      Logger.info('Path: ' + pkgPath)

      const temp = Path.join(pkgPath, 'temp')

      FsExt.copySync(Path.join(process.cwd(), 'LICENSE'), Path.join(pkgPath, 'LICENSE'))
      FsExt.mkdirpSync(temp)
      FsExt.copySync(Path.join(pkgPath, 'package.json'), Path.join(pkgPath, 'temp', 'package.json'))
      FsExt.writeJsonSync(Path.join(pkgPath, 'package.json'), rewritePkg(pkg, PkgMain), { spaces: 2 })

      execSync(`npm publish --tag=${options.tag}`, { cwd: pkgPath })

      Logger.info('Removing temporary release files')
      FsExt.copySync(Path.join(pkgPath, 'temp', 'package.json'), Path.join(pkgPath, 'package.json'))
      FsExt.removeSync(Path.join(pkgPath, 'LICENSE'))
      FsExt.removeSync(temp)

      Logger.info(`Package "${pkg.name}" published!\n`)
    }

    Logger.info('<-- Packages Published')
  })

const rewritePkg = (pkg, mainPkg) => {
  const newPkg = {}
  const fieldsToKeep = [
    'name',
    'version',
    'description',
    'peerDependencies',
    'dependencies',
    'optionalDependencies',
    'repository',
    'homepage',
    'keywords',
    'author',
    'license',
    'engines',
    'browser',
    'main',
    'types',
    'exports',
    'bin'
  ]

  fieldsToKeep.forEach(field => {
    if (typeof pkg[field] !== 'undefined') {
      newPkg[field] = pkg[field]
    }
  })

  if (!newPkg.engines) {
    newPkg.engines = mainPkg.engines
  }

  if (!newPkg.bugs) {
    newPkg.bugs = mainPkg.bugs
  }

  return newPkg
}

async function run() {
  await program.parseAsync(argv)
}

run().catch(Logger.error)
