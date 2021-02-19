const { execSync } = require('child_process')

const checkChanges = () => {
  const changed = JSON.parse(execSync('lerna changed --json').toString())

  if (changed.length === 0) {
    console.warn('Found no changes for canary release.')
    process.exit(1)
  } else {
    console.log(`Found ${changed.length} packages for canary release.`)
  }
}

checkChanges()
