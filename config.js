// Container for all the environments
const environments = {}

// Staging (default) environment
environments.staging = {
  port: process.env.PORT || 3000,
  envName: 'staging',
}

// Production environment
environments.production = {
  port: process.env.PORT || 3000,
  envName: 'production',
}

// Determine which env to export
const currentEnv = typeof(process.env.NODE_ENV) === 'string'
  ? process.env.NODE_ENV.toLowerCase()
  : ''

const env = typeof(environments[currentEnv]) === 'object'
  ? environments[currentEnv]
  : environments.staging

module.exports = env
