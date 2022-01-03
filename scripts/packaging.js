#!/usr/bin/env node

import { execSync as ExecSync } from 'child_process'
import { program as Program } from 'commander'
import * as Fs from 'fs'
import FsExt from 'fs-extra'
import { globby } from 'globby'
import Path from 'path'
import Pino from 'pino'

const PkgMain = JSON.parse(Fs.readFileSync(Path.join(process.cwd(), 'package.json')).toString())
const argv = process.argv
if (argv.length <= 2) argv.push('--help')

const Logger = Pino({
  level: 'info',
  transport: {
    target: 'pino-pretty',
    worker: { autoEnd: true },
    options: {
      colorize: true,
      messageFormat: '{msg}',
      translateTime: true,
      ignore: 'hostname'
    }
  }
})

Program.command('prepare <version>')
  .description('Prepare release')
  .action(version => {
    Logger.info('--> Preparing ...')
    Logger.info('Version: ' + version)

    Logger.info('Building ...')
    ExecSync('yarn build')

    Logger.info('Lerna Version ...')
    ExecSync(`lerna version ${version} --conventional-commits --no-push --force-publish --no-git-tag-version --yes`)

    Logger.info('Updating yarn.json ...')
    ExecSync('yarn')

    Logger.info('Reading Lerna JSON ...')
    const lerna = FsExt.readJsonSync('./lerna.json')
    const newVersion = lerna.version

    Logger.info('Tag: ' + newVersion)

    Logger.info('Commit and Tagging ...')
    ExecSync('git add .')
    ExecSync(`git commit -m "chore(release): v${newVersion}"`)
    ExecSync(`git tag v${newVersion} -m v${newVersion}`)

    Logger.info('<-- Preparation Finished')
  })

Program.command('publish')
  .description('Publishes all packages to NPM')
  .action(async () => {
    Logger.info('--> Publishing Packages\n')

    const preid = getPreid()
    const criteria = 'packages/**/package.json'
    const pkgRefs = await globby(criteria, {
      cwd: process.cwd(),
      absolute: true,
      ignore: ['**/node_modules/**', '**/out/**', '**/temp/**']
    })

    Logger.info('Context:')
    Logger.info('Pwd: ' + process.cwd())
    Logger.info('Tag: ' + preid)

    for (const pkgRef of pkgRefs) {
      const pkg = JSON.parse(Fs.readFileSync(pkgRef).toString())
      const pkgPath = pkgRef.replace('/package.json', '')

      Logger.info('Package: ' + pkg.name)
      Logger.info('Path: ' + pkgPath)

      if (!FsExt.pathExistsSync(Path.join(pkgPath, 'dist'))) {
        Logger.error(`Package ${pkg.name} does not have a "dist" path to be published.`)
        process.exit(1)
        return
      }

      const temp = Path.join(pkgPath, 'temp')

      FsExt.copySync(Path.join(process.cwd(), 'LICENSE'), Path.join(pkgPath, 'LICENSE'))
      FsExt.mkdirpSync(temp)
      FsExt.copySync(Path.join(pkgPath, 'package.json'), Path.join(pkgPath, 'temp', 'package.json'))
      FsExt.writeJsonSync(Path.join(pkgPath, 'package.json'), rewritePkg(pkg, PkgMain), { spaces: 2 })
      FsExt.removeSync(Path.join(pkgPath, 'dist', 'tsconfig.build.tsbuildinfo'))

      ExecSync(`npm publish --access public --tag=${preid}`, { cwd: pkgPath })

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
    'bin',
    'files'
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

const getPreid = () => {
  const tag = ExecSync('git describe --abbrev=0 --tags').toString()
  const pos = tag.indexOf('-')

  if (pos > -1) {
    return tag.substring(pos + 1, tag.length)
  }

  return 'latest'
}

async function run() {
  await Program.parseAsync(argv)
}

run().catch(Logger.error)
