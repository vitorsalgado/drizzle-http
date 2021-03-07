'use strict'

module.exports = {
  '*.{js,jsx,ts,tsx,md,json}': 'prettier --write',
  '*.ts': 'eslint --ext .ts .'
}
