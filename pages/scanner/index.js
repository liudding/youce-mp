// wasm路径
global.wasm_url = '/assets/opencv.wasm.br'
// opencv_exec.js会从global.wasm_url获取wasm路径
let cv = require('../../assets/opencv.js');

let listener;

const Scanner = require('../../scanner')
var delay;
Page({
  // 视频
  cameraCanvas: null,

  data: {},
  async onReady() {
    // 可见的画布
    this.initCanvas()
    this.scan()
    // return

    // setTimeout(async ()=> {
    //   const image = await  this.createImageElement("../../assets/image.png")
    //   let src = cv.matFromImageData(image)
    //   // let src = cv.imread(image);
    //   console.log(cv.Mat)
    //   let dst = new cv.Mat();
    //   // 灰度化
    //   cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY, 0);
    //   // // 显示图像
    //   cv.imshow(canvasDom, dst);
    //   // // 回收对象
    //   src.delete();
    //   dst.delete()
      
    
    // console.log(image)
    // }, 1000)

   
    // this.process(image)

 
  },

  onLoad: async function (options) {
    return
    var _that = this
    cv['onRuntimeInitialized'] = () => {
      _that.imread(_that.data.src).then(res => {
        _that.imshow("src", res)
      })
      _that.removeBg()
    };
  },
  async removeBg() {
    var _that = this
    _that.imread(_that.data.src).then(res => {
      clearTimeout(delay);
      delay = setTimeout(function () {
        let src = cv.matFromImageData(res)
        console.log(src)
        let gray = new cv.Mat();
        let blur = new cv.Mat();
        let threshold = new cv.Mat();
        let open = new cv.Mat();
        let close = new cv.Mat();
        let mask = new cv.Mat();
        let dst = new cv.Mat();
        cv.cvtColor(src, gray, cv.COLOR_BGR2GRAY);
        cv.medianBlur(gray, blur, 1)
        let blockSize = parseInt(_that.data.blockSize);
        let CSize = parseInt(_that.data.cSize);
        console.log(blockSize, CSize)
        cv.adaptiveThreshold(blur, threshold, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY_INV, blockSize, CSize);
        cv.bitwise_not(threshold, mask);
        cv.add(gray, mask, dst)
        _that.imshow("dst", dst)
        src.delete();
        gray.delete();
        threshold.delete();
        blur.delete();
        open.delete();
        close.delete();
        mask.delete();
        dst.delete();
      }, 500);
    })
  },

  async imread(path) {
    const canvas = wx.createOffscreenCanvas({
      type: '2d'
    });
    const ctx = canvas.getContext('2d')
    const img = canvas.createImage()
    await new Promise(function (resolve, reject) {
      img.onload = resolve
      img.onerror = reject
      img.src = path
    })
    canvas.height = img.height
    canvas.width = img.width
    ctx.drawImage(img, 0, 0, img.width, img.height)
    return ctx.getImageData(0, 0, img.width, img.height)
  },
  async imshow(id, mat_or_imagedata) {
    let data
    if (mat_or_imagedata instanceof cv.Mat) {
      var mat = mat_or_imagedata
      var img = new cv.Mat;
      var depth = mat.type() % 8;
      var scale = depth <= cv.CV_8S ? 1 : depth <= cv.CV_32S ? 1 / 256 : 255;
      var shift = depth === cv.CV_8S || depth === cv.CV_16S ? 128 : 0;
      mat.convertTo(img, cv.CV_8U, scale, shift);
      switch (img.type()) {
        case cv.CV_8UC1:
          cv.cvtColor(img, img, cv.COLOR_GRAY2RGBA);
          break;
        case cv.CV_8UC3:
          cv.cvtColor(img, img, cv.COLOR_RGB2RGBA);
          break;
        case cv.CV_8UC4:
          break;
        default:
          throw new Error("Bad number of channels (Source image must have 1, 3 or 4 channels)");
      }
      data = wx.createOffscreenCanvas({
        type: '2d'
      }).getContext('2d').createImageData(img.cols, img.rows)
      data.data.set(new Uint8ClampedArray(img.data))
    } else {
      data = mat_or_imagedata
    }

    let query = wx.createSelectorQuery()
    query.select('#' + id)
      .fields({
        node: true,
        size: true
      })
      .exec((res) => {
        let canvas = res[0].node
        canvas.height = data.height
        canvas.width = data.width
        let ctx = canvas.getContext('2d')
        ctx.putImageData(data, 0, 0)
      })
  },

  async createImageData(src) {
    var _that = this
    var offscreenCanvas = wx.createOffscreenCanvas({
      type: '2d'
    });
    const image = offscreenCanvas.createImageData();
    image.src = src
    await new Promise(function (resolve, reject) {
      image.onload = resolve
      image.onerror = reject

    })
    return image
  },

  async createImageElement(imgUrl) {
    var _that = this
    // 创建2d类型的离屏画布（需要微信基础库2.16.1以上）
    var offscreenCanvas = wx.createOffscreenCanvas({
      type: '2d'
    });
    const image = offscreenCanvas.createImage();
    await new Promise(function (resolve, reject) {
      image.onload = resolve
      image.onerror = reject
      image.src = imgUrl
    })
    const imageData = _that.getImageData(image, offscreenCanvas)
    return imageData
  },

  getImageData(image, offscreenCanvas) {
    var _that = this
    // const ctx = wx.createCanvasContext(canvasId);
    const maxCanvasWidth = 375;
    var canvasWidth = image.width;
    if (canvasWidth > maxCanvasWidth) {
      canvasWidth = maxCanvasWidth;
    }
    // canvas Height
    var canvasHeight = Math.floor(canvasWidth * (image.height / image.width));
    // 离屏画布的宽度和高度不能小于图像的
    offscreenCanvas.width = canvasWidth;
    offscreenCanvas.height = canvasHeight;
    // draw image on canvas
    var ctx = offscreenCanvas.getContext('2d')
    ctx.drawImage(image, 0, 0, canvasWidth, canvasHeight);
    // get image data from canvas
    var imgData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);

    return imgData
  },
  // 获取画布
  initCanvas() {
    var _that = this;
    // 视频
    wx.createSelectorQuery()
      .select('#myCanvas')
      .fields({
        node: true,
        size: true
      })
      .exec((res) => {
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d')
        // 设置画布的宽度和高度
        canvas.width = 288 ///res[0].width;
        canvas.height =352 //res[0].height;
        _that.cameraCanvas = canvas

        // console.log(res)

        // const dpr = wx.getWindowInfo().pixelRatio
        // canvas.width = res[0].width * dpr
        // canvas.height = res[0].height * dpr
        // ctx.scale(dpr, dpr)

        // ctx.beginPath()
        // ctx.strokeStyle = "red";
        // ctx.lineWidth = 5;
        // ctx.moveTo(0, 200)
        // ctx.lineTo(200, 200)
        // ctx.stroke();

      });
  },

  cameraData: undefined,
  scan: function () {
    var _that = this;
    var count = 0;
    const context = wx.createCameraContext();
    listener = context.onCameraFrame(async function (frame) {
      // 每秒60帧，这里控制每0.5获取一次图片
      if (count < 5) {
        count++;
        // return;
      }
      count = 0;
      // console.log(frame.width, frame.height)
      // _that.stopTacking()
      // onCameraFrame 获取的是未经过编码的原始 RGBA 格式的图像数据，接下来转为图片
      await _that.process(frame)

    });
    listener.start();
  },

  async process(frame) {
    // 图像处理
    const points = await Scanner.getRect(frame)

    if (!points || points.length <= 2) {
      return
    }

    // cv.imshow(this.cameraCanvas, points)
    // return

    const ctx = this.cameraCanvas.getContext("2d")
    ctx.clearRect(0, 0, 600, 900)
    ctx.beginPath();
    ctx.strokeStyle = "red";
    ctx.lineWidth = 5;

    ctx.moveTo(points.tl.x * 288 / 414, points.tl.y);
    ctx.lineTo(points.tr.x *   414/288, points.tr.y);
    ctx.lineTo(points.br.x * 414/288, points.br.y);
    ctx.lineTo(points.bl.x / (414/288), points.bl.y);
    ctx.closePath()
    ctx.stroke();
    return

    // 图像处理
    const src = cv.matFromImageData({
      data: new Uint8ClampedArray(frame.data),
      width: frame.width,
      height: frame.height
    });
    const size = src.size();
    const processWidth = 500;
    if (size.width > processWidth) {
      cv.resize(src, src, {
        width: processWidth,
        height: processWidth * size.height / size.width
      })
    }

    const gray = new cv.Mat();
    let blurred = new cv.Mat();
    let edged = new cv.Mat();

    // 灰度化
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);

    cv.GaussianBlur(gray, blurred, {
      width: 3,
      height: 3
    }, 0)
    cv.Canny(blurred, edged, 75, 200);



    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();
    cv.findContours(edged, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE, {
      x: 0,
      y: 0
    });

    let p = new cv.Mat(blurred.size(), cv.CV_8UC3);
    cv.cvtColor(blurred, p, cv.COLOR_GRAY2RGB)
    cv.drawContours(p, contours, -1, [255, 0, 0, 255], 2)

    cv.imshow(this.cameraCanvas, p);

    contours.delete()
    hierarchy.delete()

    src.delete();
    gray.delete()
    blurred.delete()


    p.delete()

  },


  changeDataToBase64(frame) {
    // 图像处理
    var src = cv.matFromImageData({
      data: new Uint8ClampedArray(frame.data),
      width: frame.width,
      height: frame.height
    });
    var dst = new cv.Mat();

    // 灰度化
    cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
    var orb = new cv.ORB();
    var keypoints = new cv.KeyPointVector();
    var descriptors = new cv.Mat();
    // 特征点
    orb.detect(src, keypoints)
    // 特征点的描述因子
    orb.compute(src, keypoints, descriptors)
    // 绘制特征点
    cv.drawKeypoints(src, keypoints, dst)
    cv.imshow(this.cameraCanvas, dst);

    src.delete();
    dst.delete()

    return

    // let that = this
    // var data = new Uint8Array(frame.data);
    // var clamped = new Uint8ClampedArray(data);
    wx.canvasPutImageData({
      canvasId: 'mycanvas',
      x: 0,
      y: 0,
      width: frame.width,
      height: frame.height,
      data: new Uint8ClampedArray(dst.data),
      fail(res) {
        console.log('fail---', res)
        // 回收对象
        // src.delete();
        // gray.delete()
      },
      success(res) {
        // 回收对象
        // src.delete();
        // gray.delete()
        // 转换临时文件
        console.log('success---', res)
        // wx.canvasToTempFilePath({
        // 	x: 0,
        // 	y: 0,
        // 	width: frame.width,
        // 	height: frame.height,
        // 	canvasId: 'mycanvas',
        // 	fileType: 'jpg',
        // 	destWidth: frame.width,
        // 	destHeight: frame.height,
        // 	// 精度修改
        // 	quality: 0.8,
        // 	success(res) {
        // 		console.log('success2---',res)
        // 		// 临时文件转base64
        // 		wx.getFileSystemManager().readFile({
        // 			filePath: res.tempFilePath, //选择图片返回的相对路径
        // 			encoding: 'base64', //编码格式
        // 			success: res => {
        // 				// 保存base64
        // 				let base64 = res.data;    
        // 				// 拿到数据后的其他操作   
        // 			}
        // 		})
        // 	},
        // 	fail(res) {
        // 		console.log('fail2---',res)
        // 		wx.showToast({
        // 			title: '图片生成失败，重新检测',
        // 			icon: 'none',
        // 			duration: 1000
        // 		})
        // 		// 测试的时候发现安卓机型，转为临时文件失败，这里从新获取帧数据，再转码就能成功，不知道为什么
        // 		that.startTacking()
        // 	}
        // }, that)
      }
    })
  },
  // 结束相机实时帧
  stopTacking() {
    if (listener) {
      listener.stop();
      console.log('stopTacking!!')
    }
  },
})