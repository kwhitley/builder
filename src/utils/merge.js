const chalk = require('chalk')

module.exports = (a, b, namespace) => {
  if (!a || !b) return false

  const overrides = [ 'scripts', 'main', 'license' ]

  Object.keys(b).forEach(key => {
    if (!a.hasOwnProperty(key) || overrides.includes(key)) {
      a[key] = b[key]
      console.log(chalk.gray((namespace ? (namespace + ': ') : '') + `adding "${key}"`))
    }
  })
}
