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
const dynamoDB = new AWS.DynamoDB(aws_keys.dynamodb)

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

/*************************** DYNAMO DB  ************************** */

//subir foto y guardar en dynamo
app.post('/saveImageDb', function (req, res) {
  let body = req.body

  let name = body.name // nombre de la imagen
  let image = body.base64 // imagen en base64
  let extension = body.extension // extension de la imagen

  let decodedImage = Buffer.from(image, 'base64') // Pasamos de base 64 a binario para guardarlo en bucket
  let filename = name + '.' + extension // cadena de nombre de la imagen

  let bucketname = 'semi1-tabladynamo' // nombre del bucket
  let folder = 'fotos/' // carpeta donde se guardara la imagen
  let path = `${folder}${filename}` // /fotos/imagen.jpg

  let params = {
    Bucket: bucketname,
    Key: path,
    Body: decodedImage,
    ACL: 'public-read', // ACL -> LE APLICA LA POLITICA AL OBJETO QUE SE ESTA GUARDANDO, politica de solo lectura y publica
  }

  s3.upload(params, function sync(err, data) {
    if (err) {
      console.log(err)
      res.json({ mensaje: 'Error al subir la imagen', error: err, status: false })
    } else {
      console.log('Subido exitosamente a S3 ' + data.Location)

      dynamoDB.putItem(
        {
          TableName: 'tabladynamo', // el nombre de la tabla de dynamoDB
          Item: {
            // Atributos de nuestra tabla
            id: { S: '2' }, // el id de la imagen
            name: { S: name },
            location: { S: data.Location },
          },
        },
        function (err, data) {
          if (err) {
            console.log(err)
            res.json({ mensaje: 'Error al subir la imagen', error: err, status: false })
          } else {
            console.log(data)
            res.json({ mensaje: 'Imagen subida exitosamente a Dynamo', status: true })
          }
        },
      )
    }
  })
})

app.get('/getImageDb', function (req, res) {
  let params = {
    TableName: 'tabladynamo',
    Key: {
      id: { S: '1' },
    },
  }

  dynamoDB.getItem(params, function (err, data) {
    if (err) {
      console.log(err)
      res.json({ mensaje: 'Error al obtener la imagen', error: err, status: false })
    } else {
      console.log(data)
      res.json({
        mensaje: 'Imagen obtenida exitosamente de Dynamo',
        data: data,
        status: true,
      })
    }
  })
})

//*********************************************RDS******************************************************

// INSERT BASE DE DATOS

app.post('/insertar', function (req, res) {
  let body = req.body
  conn.query(
    'INSERT INTO `ejemplo` (`id`, `nombre`) VALUES (?, ?)',
    [body.id, body.nombre],
    function (err, result) {
      if (err) {
        console.log(err)
        res.json({ mensaje: 'Error al insertar', error: err, status: false })
      } else {
        res.json({ mensaje: 'Insertado exitosamente', status: true })
      }
    },
  )
})

// OBTENER BASE DE DATOS
app.get('/obtener', function (req, res) {
  conn.query('SELECT * FROM ejemplo', function (err, result) {
    if (err) {
      console.log(err)
      res.json({ mensaje: 'Error al obtener', error: err, status: false })
    } else {
      res.json({ mensaje: 'Obtenido exitosamente', data: result, status: true })
    }
  })
})
