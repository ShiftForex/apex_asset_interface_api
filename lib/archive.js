// this could be used to load multiple provider services

config = {
  providers:{
    gubiq: {
  
    },
    iota:{
  
    }
  },
}

const providerServices = {}

for (provider in config.providers){
    const ProviderService = require(`./${provider}Service.js`)
    providerServices[provider] = new ProviderService({...config.providers[`${provider}`], logger})
}