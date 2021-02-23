#!/usr/bin/env node

/* eslint-disable */

'use strict'

const Path = require('path')
const FsExt = require('fs-extra')
const Rollup = require('rollup')
const AutoExternal = require('rollup-plugin-auto-external')
const GeneratePackageJson = require('rollup-plugin-generate-package-json')
const { nodeResolve: NodeResolve } = require('@rollup/plugin-node-resolve')
const Copy = require('rollup-plugin-copy')
const Pino = require('pino')
const Globby = require('globby')

const PackageMain = require('./package.json')
const Config = require('./project.build.config')
const DistDir = 'dist'

const Logger = Pino({
  level: 'info',
  prettyPrint: { colorize: true, messageFormat: '{msg}', translateTime: true, ignore: 'hostname' }
})

async function run() {
  Logger.info('START: Build Release')

  const pkgRefs = await Globby('pkgs/**/package.json',
    {
      cwd: process.cwd(),
      absolute: true,
      ignore: ['**/node_modules/**', '**/dist/**', '**/dist-es5/**', ...Config.distributions.map(({ from }) => `**/${from}/**`)]
    })

  for (const pkgRef of pkgRefs) {
    const pkg = require(pkgRef)

    Logger.info('Package: ' + pkg.name)
    Logger.info('Ref: ' + pkgRef)

    if (Config.ignorePackages.includes(pkg.name) || pkg.private) {
      Logger.info(`Ignoring Package: "${pkg.name}"`)
      continue
    }

    const pkgPath = pkgRef.replace('/package.json', '')
    const destination = Config.dist

    for (const { from, to } of Config.distributions) {
      Logger.info('Cleaning: ' + Path.join(pkgPath, from).toString())
      FsExt.removeSync(Path.join(pkgPath, from))

      const pkgDist = pkgPath.replace('/pkgs/', `/${from}/pkgs/`)
      const pkgSrc = Path.resolve(pkgDist, 'src')
      const pkgEntry = Path.resolve(pkgSrc, 'index.js')
      const pkgDest = Path.join(destination, pkg.name, to)

      Logger.info(`From: ${from} -- To: ${to}`)
      Logger.info('Dist: ' + pkgDist)
      Logger.info('Source: ' + pkgSrc)
      Logger.info('Entry: ' + pkgEntry)
      Logger.info('Destination: ' + pkgDest)

      const options = {
        input: pkgEntry,
        inlineDynamicImports: true,
        plugins: [
          NodeResolve(),
          AutoExternal({
            packagePath: pkgPath,
            dependencies: true,
            peerDependencies: true,
            builtins: true
          }),
          GeneratePackageJson({
            baseContents: rewritePkg(pkg, { from }),
            additionalDependencies: Object.keys(pkg.dependencies || {}),
            outputFolder: pkgDest
          }),
          Copy({
            targets: [
              { src: Path.resolve(pkgPath, 'README.md'), dest: pkgDest },
              { src: Path.resolve(pkgPath, 'CHANGELOG.md'), dest: pkgDest },
              { src: 'LICENSE', dest: pkgDest, rename: 'LICENSE.txt' }
            ]
          })
        ]
      }

      const bundle = await Rollup.rollup(options)
      const common = { preferConst: true, sourcemap: true }
      const generates = [
        {
          ...common,
          file: Path.join(pkgDest, 'index.cjs.js'),
          format: 'cjs'
        },
        {
          ...common,
          file: Path.join(pkgDest, 'index.esm.js'),
          format: 'esm'
        }
      ]

      for (const opts of generates) {
        await bundle.write(opts)
      }

      const declarations = await Globby('**/*.d.ts', { cwd: pkgSrc, ignore: ['**/node_modules/**'] })

      for (const declaration of declarations) {
        FsExt.copySync(Path.join(pkgSrc, declaration), Path.resolve(pkgDest, declaration))
      }
    }

    Logger.info('---')
  }

  Logger.info('FINISHED: Build Release')
}

const rewritePkg = (pkg, opts) => {
  const newPkg = {}
  const fieldsToKeep = [
    'name',
    'version',
    'description',
    'sideEffects',
    'peerDependencies',
    'dependencies',
    'optionalDependencies',
    'repository',
    'homepage',
    'keywords',
    'author',
    'license',
    'engines',
    'browser'
  ]

  fieldsToKeep.forEach(field => {
    if (typeof pkg[field] !== 'undefined') {
      newPkg[field] = pkg[field]
    }
  })

  newPkg.main = 'index.cjs.js'
  newPkg.module = 'index.esm.js'
  newPkg.typings = 'index.d.ts'

  if (typeof pkg.browser !== 'undefined') {
    newPkg.browser = 'index.esm.js'
  }

  newPkg.license = PackageMain.license

  if (pkg.bin) {
    newPkg.bin = {}

    for (const alias in pkg.bin) {
      newPkg.bin[alias] = pkg.bin[alias].replace(`${DistDir}/`, '')
    }
  }

  return newPkg
}

(async () => await run())()
