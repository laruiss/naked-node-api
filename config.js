// Container for all the environments
const environments = {}

// Staging (default) environment
environments.staging = {
  httpPort: process.env.PORT || 3000,
  httpsPort: process.env.PORT || 3043,
  envName: 'staging',
  hashingSecret: 'ThisIsABigSecret'
}

// Production environment
environments.production = {
  httpPort: process.env.PORT || 5000,
  httpsPort: process.env.PORT || 5043,
  envName: 'production',
  hashingSecret: 'ThisIsABiggerSecret'
}

// Determine which env to export
const currentEnv = typeof(process.env.NODE_ENV) === 'string'
  ? process.env.NODE_ENV.toLowerCase()
  : ''

const env = typeof(environments[currentEnv]) === 'object'
  ? environments[currentEnv]
  : environments.staging

module.exports = env
