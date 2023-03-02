const aws_keys = require('../helpers/aws_keys')
var AWS = require('aws-sdk') //importamos el sdk de aws
//instanciamos los servicios a utilizar con sus respectivos accesos.

const s3 = new AWS.S3(aws_keys.s3)
const dynamoDB = new AWS.DynamoDB(aws_keys.dynamodb)
/*************************** DYNAMO DB  ************************** */

//subir foto y guardar en dynamo
var saveImageDynamo = async (req, res) => {
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
}

var getImageDynamo = async (req, res) => {
  let params = {
    TableName: 'testDB',
    Key: {
      id: { S: '3' },
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
}

module.exports = {
  saveImageDynamo,
  getImageDynamo,
}
