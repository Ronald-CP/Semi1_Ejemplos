var Router = require('express')
const { signin } = require('../controller/cognito.controller')

const router = Router()

// router.post('/login', login)
router.post('/signin', signin)

module.exports = router
