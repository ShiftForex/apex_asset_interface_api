var router = function(app) {

  
  app.post("/testing", function(req, res) {

      res.status(401).send({ msg: "Invalid function!!"}); 

    

  });
}

module.exports = router;
