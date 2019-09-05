#!/usr/bin/env node
require('dotenv').config()

const chalk = require('chalk')
const cmd = require('node-cmd')
const util = require('util')
const cmdAsync = util.promisify(cmd.get)
const getNpmToken = require('./utils/getNpmToken')
const { ROOT_PATH } = require('./paths')
const rootPackage = require(`${ROOT_PATH}/package.json`)
const DEPRECATED_PACKAGES = require('./deprecations')

const ARUNDO_SCOPE = '@arundo'

const updateCoreDeps = async () => {
  const { token, exportPrefix } = await getNpmToken()
  if (!token) return false

  // list scannable dependency branch locations
  let dependencyBranches = ['dependencies', 'devDependencies', 'peerDependencies']

  // get list of @arundo deps within these branches
  let arundoDeps = dependencyBranches.reduce((dependencySet, branch) => {
    let deps = rootPackage[branch] || {}

    Object
      .keys(deps)
      .filter(d => d.includes('@arundo'))
      .forEach(d => dependencySet.add(d))

    return dependencySet
  }, new Set())

  const deprecatedPackageNames = Object.keys(DEPRECATED_PACKAGES)

  // show warnings for all deprecated packages
  arundoDeps.forEach(packageName => {
    // if @arundo package is found in list of deprecated package names...
    if (deprecatedPackageNames.includes(packageName)) {
      let deprecation = DEPRECATED_PACKAGES[packageName]

      console.log(chalk.red('\nDEPRECATION NOTICE:'))

      if (deprecation.replacement) {
        console.log(
          chalk.redBright(packageName),
          chalk.white('has been replaced with'),
          chalk.green(deprecation.replacement)
        )
      } else {
        console.log(
          chalk.redBright(packageName),
          chalk.white('has been deprecated')
        )
      }

      if (deprecation.example) {
        console.log(
          chalk.grey('[Example] --> ' + deprecation.example)
        )
      }
    }
  })

  const upgradeCommand = `yarn upgrade --scope ${ARUNDO_SCOPE}`
  process.stdout.write(chalk.grey(`syncing ${ARUNDO_SCOPE} packages... `))

  await cmdAsync(exportPrefix + upgradeCommand)
    .then(() => console.log(chalk.green('ok')))
    .catch((err) => {
      console.log(chalk.red('fail\n'))
      console.log(chalk.red(err) + '\n')
    })
}

updateCoreDeps()
