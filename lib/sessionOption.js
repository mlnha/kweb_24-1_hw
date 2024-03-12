var options = {  
    host: 'localhost',
    user: 'root',
    password: '0324',
    database: 'kweb_hw',
    port: 3306,
    
    clearExpired : true ,             
    checkExpirationInterval: 10000,  
    expiration: 1000*60*60*2,
  };
  
  module.exports = options;