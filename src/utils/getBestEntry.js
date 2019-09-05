const globby = require('globby')
const chalk = require('chalk')

const validExtensions = ['tsx', 'ts', 'jsx', 'js']

module.exports = async (origin) => {
  let indexDescription = `index.{${validExtensions.join(',')}}`

  try{
    let paths = await globby(origin + '/' + indexDescription, {
      extensions: validExtensions,
      onlyFiles: true,
    })

    let entryExtensions = paths
                            .map(p => p.replace(/^.*\.(\w{1,3})$/, '$1'))
                            .sort((a,b) => a < b ? -1 : 1)

    if (!entryExtensions.length) {
      return console.log(chalk.red(`could not find ${indexDescription} file in ${origin}`)) || false
    }

    if (entryExtensions.length > 1) {
      console.log(chalk.magenta(`\n[WARNING] found multiple index files in ${origin}, using files in this priority:\nts > jsx > js\n`))
    }

    return entryExtensions.pop()
  } catch(err) {
    return console.log(chalk.red(`could not find ${indexDescription} file in ${SOURCE_CLIENT}`)) || false
  }
}
