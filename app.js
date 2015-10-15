var koa = require('koa');
var path = require('path');
var render = require('koa-ejs');
var koaBody = require('koa-body');
var statics = require('koa-static');
var router = require('koa-router')();
var thunkify = require('thunkify-wrap').genify;
var fs = require('fs');
var qn = require('qn');

var app = module.exports = koa();

// 上传图片
app.use(koaBody({
  multipart: true,
  formidable: {
    uploadDir: path.join(__dirname, 'public/uploads'),
    maxFieldsSize: 500,
    keepExtensions: true
  }
}));

app.use(statics(path.join(__dirname, 'public')));

render(app, {
  root: path.join(__dirname, 'views'),
  layout: 'layout',
  viewExt: 'html'
});

app.use(router.routes());

// 上传七牛
var client = qn.create({
  accessKey: 'your access key',
  secretKey: 'your secret key',
  bucket: 'your bucket name',
  domain: 'http://{bucket}.u.qiniudn.com'
});

client.upload = thunkify(client.upload);

// 路由
router.get('/', function*() {
  yield this.render('index');
});

router.post('/api/uploadImg', function*() {
  var file = this.request.body.files['avatar'];
  try {
    var result = yield * client.upload(fs.createReadStream(file.path));
    this.body = {
      ok: true,
      data: {
        filepath: 'http://7xndo3.com1.z0.glb.clouddn.com/' + result[0].key
      }
    };
  } catch (e) {
    console.log(e)
  }
});

app.listen(8080, function() {
  console.log('listening on port ' + 8080 + '.');
})