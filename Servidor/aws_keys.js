let aws_keys = {
  s3: {
    region: '',
    accessKeyId: '',
    secretAccessKey: '',
    //apiVersion: '2006-03-01',
  },
  dynamodb: {
    //apiVersion: '2012-08-10',
    region: '',
    accessKeyId: '',
    secretAccessKey: '',
  },
  rekognition: {
    region: '',
    accessKeyId: '',
    secretAccessKey: '',
  },
  translate: {
    region: '',
    accessKeyId: '',
    secretAccessKey: '',
  },
  cognito: {
    UserPoolId: '',
    ClientId: '',
  },
}
module.exports = aws_keys
