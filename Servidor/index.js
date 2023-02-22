require('dotenv').config()
var express = require('express')
var bodyParser = require('body-parser')
const mysql = require('mysql')

var app = express()

const cors = require('cors')
var corsOptions = { origin: true, optionsSuccessStatus: 200 }
app.use(cors(corsOptions))
app.use(bodyParser.json({ limit: '10mb', extended: true }))
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }))

var port = 4000
app.listen(port)
console.log('Escuchando en el puerto', port)

// se manda a llamar las credenciales de Mysql
const db_credentials = require('./db_creds')
var conn = mysql.createPool(db_credentials)

//Se inicializa el sdk para menejar los servicios de AWS
const aws_keys = require('./aws_keys')
var AWS = require('aws-sdk')

//instanciamos los servicios a utilizar con sus respectivos accesos.
const s3 = new AWS.S3(aws_keys.s3)
//const dynamoDB = new AWS.DynamoDB(aws_keys.dynamodb)

//*********************************************ALMACENAMIENTO****************************************************
// ruta que se usa para subir una foto

app.post('/subirfoto', function (req, res) {
  var id = req.body.id
  var foto = req.body.foto
  //carpeta y nombre que quieran darle a la imagen

  var cadena = 'fotos/' + id + '.jpg' // fotos -> se llama la carpeta UBICACION
  //se convierte la base64 a bytes
  let buff = new Buffer.from(foto, 'base64')

  AWS.config.update({
    region: 'us-east-1', // se coloca la region del bucket
    accessKeyId: '',
    secretAccessKey: '',
  })

  var s3 = new AWS.S3() // se crea una variable que pueda tener acceso a las caracteristicas de S3

  const params = {
    Bucket: 'semi1test', // nombre
    Key: cadena, // Nombre de ubicacion
    Body: buff, // Imagen enn bytes
    ContentType: 'image', // tipo de contenido
  }
  const putResult = s3.putObject(params).promise()
  res.json({ mensaje: putResult, status: true })
})

app.post('/obtenerfoto', function (req, res) {
  var id = req.body.id
  var cadena = 'fotos/' + id + '.jpg'

  AWS.config.update({
    region: 'us-east-1', // se coloca la region del bucket
    accessKeyId: '',
    secretAccessKey: '',
  })

  var S3 = new AWS.S3()

  var getParams = {
    Bucket: 'semi1test',
    Key: cadena,
  }

  S3.getObject(getParams, function (err, data) {
    if (err) {
      res.json(err)
    } else {
      var dataBase64 = Buffer.from(data.Body).toString('base64') //resgresar de byte a base
      res.json({ mensaje: dataBase64 })
    }
  })
})
