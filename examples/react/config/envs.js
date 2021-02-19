'use strict'

const Joi = require('joi')

module.exports = Joi.object(
  {
    DEBUG_MODE: Joi.boolean().default(false).truthy('true', 'on', 't', 1).falsy('false', 'off', 'f', 0),
    PUBLIC_URL: Joi.string().allow('').default(''),
    DEV_SERVER: Joi.string().default('').allow(''),
    DEV_SERVER_PORT: Joi.number().default(3000)
  })
  .unknown(true)
  .options({ abortEarly: false })
