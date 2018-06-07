
class iotaClient {
  constructor(options){
      this.options = options || {}
      this.logger = this.options.logger
  }

  // this is where all of the coin specific stuff goes...

  async identify() {
      try{
            this.logger.log(`I am a ${this.options.name} client`)
          
      } catch(err){
          return Promise.reject(err)
      }
    
  }

 
}

module.exports = iotaClient
