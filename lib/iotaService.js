
class iotaService {
  constructor(options){
      this.options = options || {}
      this.logger = this.options.logger
  }
  
  async identify() {
      try{
            this.logger.log(`I am a ${this.options.name} client`)
      } catch(err){
          return Promise.reject(err)
      } 
  } 
}

module.exports = iotaService
