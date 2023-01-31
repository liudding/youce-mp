global.wasm_url = '/assets/opencv3.4.16.wasm.br'
// opencv_exec.js会从global.wasm_url获取wasm路径
const cv = require('./assets/opencv_exec.js');

const COLOR_RED = [255, 0, 0, 255];
const COLOR_BLUE = [0, 0, 255, 255];
const COLOR_GREEN = [0, 255, 0, 255];

const form = {
  borderWidth: 5
}

async function getRect(frame) {
  const src = matFromFrame(frame)
  // const size = src.size();
  // const processWidth = 500;
  // if (size.width > processWidth) {
  //     cv.resize(src, src, { width: processWidth, height: processWidth * size.height / size.width})
  // }

  let gray = new cv.Mat();
  let blurred = new cv.Mat();
  let edged = new cv.Mat();

  cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

  cv.GaussianBlur(gray, blurred, {
    width: 3,
    height: 3
  }, 0)
  cv.Canny(blurred, edged, 75, 200);

  src.delete()
  // gray.delete()
  blurred.delete()

  // find contours in the edge map, then initialize
  // the contour that corresponds to the document
  let contours = new cv.MatVector();
  let hierarchy = new cv.Mat();
  cv.findContours(edged, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE, {
    x: 0,
    y: 0
  });

  edged.delete()


  if (contours.size() <= 0) {
    console.log('no contours found')
    return
  }

  const contourAreaArray = [];
  for (let i = 0; i < contours.size(); i++) {
    const cnt = contours.get(i);
    const area = cv.contourArea(cnt, false)
    // if (area < 1000) {
    //     continue
    // }

    contourAreaArray.push({
      area,
      index: i
    })
  }

  contourAreaArray.sort((a, b) => {
    /* Sort largest value first */
    if (a.area < b.area) {
      return 1
    } else if (a.area > b.area) {
      return -1
    }
    return 0
  })


  let regionCnt;

  for (let cntArea of contourAreaArray) {
    const cnt = contours.get(cntArea.index);

    const peri = cv.arcLength(cnt, true)
    let approx = new cv.Mat();
    cv.approxPolyDP(cnt, approx, peri * 0.02, true)

    // if our approximated contour has four points,
    // then we can assume we have found the paper
    if (approx.rows === 4) {
      regionCnt = approx;
      break;
    } else {
      approx.delete()
    }
  }

  contours.delete();
  hierarchy.delete();


  if (!regionCnt) {
    console.log('no rect found')
    return
  }

  const data = regionCnt.data32S
  const points =  [{
      x: data[0],
      y: data[1]
    }, {
      x: data[2],
      y: data[3]
    },
    {
      x: data[4],
      y: data[5]
    }, {
      x: data[6],
      y: data[7]
    }
  ]

  regionCnt.delete()

  const corners = sortCorners(points)
  return corners

  let p = new cv.Mat(gray.size(), cv.CV_8UC3);
  cv.cvtColor(gray, p, cv.COLOR_GRAY2RGB)

  cv.line(p, corners.tl, corners.tr, COLOR_RED)
  cv.line(p, corners.tr, corners.br, COLOR_RED)
  cv.line(p, corners.br, corners.bl, COLOR_RED)
  cv.line(p, corners.bl, corners.tl, COLOR_RED)

  return p
}

function matFromFrame(frame) {
  return cv.matFromImageData({
    data: new Uint8ClampedArray(frame.data),
    width: frame.width,
    height: frame.height
  });
}


async function process(frame, canvasDom) {
  const src = matFromFrame(frame)
  let gray = new cv.Mat();
  cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
  
  const points = await getRect(frame)

  src.delete()

  const result = await perspectiveTransform(gray, points)

  const roi = await cropRoi(result.warped, result.width, result.height, form.borderWidth)

  cv.GaussianBlur(roi, roi, {
    width: 3,
    height: 3
  }, 0)

  // apply Otsu's thresholding method to binarize the warped
  // piece of paper
  let thresh = new cv.Mat();
  cv.threshold(roi, thresh, 0, 255, cv.THRESH_BINARY_INV | cv.THRESH_OTSU)

  let questionContours = new cv.MatVector();
  let questionHierarchy = new cv.Mat();
  cv.findContours(thresh, questionContours, questionHierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

  const bubbles = [];

  for (let i = 0; i < questionContours.size(); i++) {
    const cnt = questionContours.get(i);
    const rect = cv.boundingRect(cnt);
    const ratio = rect.width / rect.height

    if (rect.width >= 20 && rect.height >= 20 && ratio >= 0.9 && ratio <= 1.1) {
      bubbles.push({
        contour: cnt,
        rect,
      })
    }
  }


  let pp = new cv.Mat(roi.size(), cv.CV_8UC3);
  cv.cvtColor(roi, pp, cv.COLOR_GRAY2RGB)
  cv.drawContours(pp, questionContours, -1, COLOR_RED, 2)

  // 排列
  const questions = sortBubbles(bubbles)

  // let i = 0;
  // let questionCnts = new cv.MatVector();
  // for (let bubble of bubbles) {
  //   if (i > 200) {
  //     break;
  //   }
  //   questionCnts.push_back(bubble.contour)

  //   i++;
  // }
  

  let filled = new cv.MatVector();

  for (const bubble of bubbles) {
    const cnt = bubble.contour
    const mask = cv.Mat.zeros(thresh.size(), cv.CV_8UC1);

    let mat = new cv.MatVector();
    mat.push_back(cnt)
    cv.drawContours(mask, mat, -1, [255, 255, 255, 255], -1)

    // let b = new cv.Mat();
    cv.bitwise_and(thresh, thresh, mask, mask)

    const total = cv.countNonZero(mask)
    // console.log(total, cv.contourArea(cnt, false))

    if (total / cv.contourArea(cnt, false) >= 2 / 3) {
      // console.log('===  true')
      bubble.filled = true

      filled.push_back(cnt)
    } else {
      // console.log('===  false', total / cv.contourArea(cnt, false))
    }
  }

  // p = roi.clone()
  // let dst = cv.Mat.zeros(roi.size(), cv.CV_8UC3)
  // cv.drawContours(dst, filled, -1, [255, 0, 0, 255], 4)

  return drawContours(roi, filled)
}


async function perspectiveTransform(src, pts) {

  let {
    tl,
    tr,
    br,
    bl
  } = pts //sortCorners(pts)


  // let [tl, tr, br, bl] = rect

  // compute the width of the new image, which will be the
  // maximum distance between bottom-right and bottom-left
  // x-coordiates or the top-right and top-left x-coordinates
  let widthA = Math.sqrt(Math.pow(br.x - bl.x, 2) + Math.pow(br.y - bl.y, 2))
  let widthB = Math.sqrt(Math.pow(tr.x - tl.x, 2) + Math.pow(tr.y - tl.y, 2))
  let maxWidth = Math.max(Math.floor(widthA), Math.floor(widthB))
  //
  // compute the height of the new image, which will be the
  // maximum distance between the top-right and bottom-right
  // y-coordinates or the top-left and bottom-left y-coordinates
  let heightA = Math.sqrt(Math.pow(tr.x - br.x, 2) + Math.pow(tr.y - br.y, 2))
  let heightB = Math.sqrt(Math.pow(tl.x - bl.x, 2) + Math.pow(tl.y - bl.y, 2))
  let maxHeight = Math.max(Math.floor(heightA), Math.floor(heightB))

  console.log(maxWidth, maxHeight)


  // now that we have the dimensions of the new image, construct
  // the set of destination points to obtain a "birds eye view",
  // (i.e. top-down view) of the image, again specifying points
  // in the top-left, top-right, bottom-right, and bottom-left
  // order
  let dstRect = [
    [0, 0],
    [maxWidth - 1, 0],
    [maxWidth - 1, maxHeight - 1],
    [0, maxHeight - 1]
  ]


  let srcTri = cv.matFromArray(4, 1, cv.CV_32FC2, [tl.x, tl.y, tr.x, tr.y, br.x, br.y, bl.x, bl.y])
  let dstTri = cv.matFromArray(4, 1, cv.CV_32FC2, [0, 0, maxWidth - 1, 0, maxWidth - 1, maxHeight - 1, 0, maxHeight - 1])
  let M = cv.getPerspectiveTransform(srcTri, dstTri)
  let dsize = new cv.Size(src.cols, src.rows)
  let warped = new cv.Mat()
  cv.warpPerspective(src, warped, M, dsize, cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar())

  srcTri.delete()
  dstTri.delete()
  M.delete()

  return {
    warped: warped,
    width: maxWidth,
    height: maxHeight
  }

}

function sortCorners(pts) {

  // the top-left point will have the smallest sum, and
  // the bottom-right point will have the largest sum
  let max = 0
  let min = Infinity
  let diffMax = -Infinity
  let diffMin = Infinity

  const corners = {};

  for (let pt of pts) {
    let sum = pt.x + pt.y
    let diff = pt.x - pt.y

    if (sum > max) {
      max = sum;
      corners.br = pt;
    }

    if (sum < min) {
      min = sum
      corners.tl = pt;
    }

    if (diff > diffMax) {
      diffMax = diff
      corners.tr = pt
    }
    if (diff < diffMin) {
      diffMin = diff
      corners.bl = pt
    }
  }

  return corners
}


async function cropRoi(src, width, height, padding = 15) {

  let warpSize = src.size()

  let rect = new cv.Rect(
    padding, padding,
    Math.min(warpSize.width, width) - padding * 2,
    Math.min(warpSize.height, height) - padding * 2
  )

  let dst = cv.Mat.zeros(rect.width, rect.height, cv.CV_8UC3)
  dst = src.roi(rect)
  return dst;
}

function sortBubbles(bubbles) {

  // top to bottom
  bubbles.sort(function (a, b) {
    if (a.rect.y < b.rect.y) {
      return -1;
    } else if (a.rect.y > b.rect.y) {
      return 1
    }

    return 0
  })

  const bubbleHeight = bubbles[0].rect.height
  const bubbleWidth = bubbles[0].rect.width

  // console.log("BUBBLE HEIHT", bubbleHeight)

  const lines = []
  let index = 0
  for (const bubble of bubbles) {
    console.log("BUBBLe: ", bubble.rect.y)
    if (lines[index] === undefined) {
      lines[index] = {
        bubbles: [bubble],
        cols: []
      }
      continue
    }

    if (Math.abs(bubble.rect.y - lines[index].bubbles[0].rect.y) < bubbleHeight / 2) {
      lines[index].bubbles.push(bubble)
    } else {
      console.log('    next line');
      // y 左边相差过大，则视作新的一行
      index++
      lines[index] = {
        bubbles: [bubble],
        cols: []
      }
    }
  }



  // 将每行的bubble 分列，区分出不同的题目

  for (const line of lines) {
    line.bubbles.sort(function (a, b) {
      return a.rect.x < b.rect.x ? -1 : 1
    })


    for (const bubble of line.bubbles) {

    }

  }

  return lines
}

function drawContours(src, cnts) {
  let p = new cv.Mat(src.size(), cv.CV_8UC3);
  cv.cvtColor(src, p, cv.COLOR_GRAY2RGB)
  cv.drawContours(p, cnts, -1, COLOR_RED, 2)
  return p
}

module.exports = {
  getRect,
  process
}