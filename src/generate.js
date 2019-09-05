#!/usr/bin/env node
require('dotenv').config()

const fs = require('fs-extra')
const path = require('path')
const globby = require('globby')
const chalk = require('chalk')
const cmd = require('node-cmd')
const { ROOT_PATH } = require('./paths')
const { SUBPATH } = process.env

const destinationFolder = (ROOT_PATH + (SUBPATH || '')).replace(/\\/g, '/')
const sourceFolder = (path.join(__dirname, '../template')).replace(/\\/g, '/')

const merge = require('./utils/merge')

const mergePackage = async () => {
  const rootPackage = require(`${ROOT_PATH}/package.json`)
  const templatePackage = require(`${sourceFolder}/package.json`)
  console.log('\nUpgrading project package.json...')

  merge(rootPackage, templatePackage)
  merge(rootPackage.dependencies, templatePackage.dependencies, 'dependencies')
  merge(rootPackage.devDependencies, templatePackage.devDependencies, 'devDependencies')

  try {
    await fs.writeJson(`${destinationFolder}/package.json`, rootPackage, { spaces: 2 })
  } catch(err) {
    console.error('\n', err)
  }
}

async function generate() {
  const paths = await globby(sourceFolder, {
    dot: true,
    onlyFiles: true,
  })
  let errors = []

  console.log('\nCopying template files to', chalk.whiteBright(`${destinationFolder}...`))

  for (var path of paths) {
    let shortPath = path.replace(sourceFolder, '')
    let destinationPath = path
                            .replace('_.', '.')
                            .replace(sourceFolder, destinationFolder)

    if (path.includes('package.json')) {
      continue
    }

    process.stdout.write(chalk.gray(`creating ${shortPath} in ${destinationPath}... `))

    try {
      await fs.copy(path, destinationPath, {
        overwrite: false,
        errorOnExist: true,
      })
      console.log(chalk.green('ok'))
    } catch(err) {
      errors.push(path)
      console.error(chalk.red('fail'))
    }
  }

  if (!errors.length) {
    console.log('\nSuccess!')
  } else {
    console.log('\nCould not copy the following', chalk.yellowBright(errors.length), 'files:')
    console.log(chalk.yellow(errors.join('\n')))
  }

  await mergePackage()

  // if in test mode, exit
  if (SUBPATH) return console.log(chalk.green('\nSuccess!\n'))

  // final pass, install packages and release commands to user
  console.log('\nInstalling packages (this will take awhile)...')

  cmd.get(exportPrefix + 'yarn', (err, data, stderr) => {
    console.log(chalk.gray(data))

    console.log('AVAILABLE COMMANDS')
    console.log(chalk.green('yarn dev'), chalk.gray('starts the dev server'))
    console.log(chalk.green('yarn build'), chalk.gray('starts the build server'))

    console.log(chalk.green('\nSuccess!\n'))
  })
}

generate()
