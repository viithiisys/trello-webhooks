var express = require('express');
var router = express.Router();
/*################### Including all JS #######################*/
var trello = require('../trello/trello.js');
/*##########################################################*/

/*################### Routes ##############################*/

/* GET home page. */
router.get('/layout', function(req, res) { 
  res.render('layout', {
   title: 'Viithiisys/layout' 
  });
})

router.post('/layout', trello.trelloDevice);

router.get('/gets', function(req, res) { 
  res.render('layout', {
   title: 'Viithiisys/layout' 
  });
})

router.post('/gets', trello.trelloHookDevice);

/*##########################################################*/

module.exports = router;