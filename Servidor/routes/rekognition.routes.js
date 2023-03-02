var Router = require('express')
const {
  detectarCara,
  detectarTexto,
  detectarFamoso,
  detectarEtiquetas,
  compararFotos,
  detectarEquipo,
} = require('../controller/rekognition.controller')

const router = Router()

router.post('/detectarcara', detectarCara)
router.post('/detectartexto', detectarTexto)
router.post('/detectarfamoso', detectarFamoso)
router.post('/detectaretiquetas', detectarEtiquetas)
router.post('/compararfotos', compararFotos)
router.post('/detectarEquipo', detectarEquipo)

module.exports = router
