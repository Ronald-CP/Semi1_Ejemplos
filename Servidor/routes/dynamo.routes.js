var Router = require('express')
const { getImageDynamo, saveImageDynamo } = require('../controller/dynamo.controller')

const router = Router()

router.post('/saveImageDb', saveImageDynamo)
router.get('/getImageDb', getImageDynamo)
module.exports = router
