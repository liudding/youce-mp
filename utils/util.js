const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}


const clone = (obj) => {
  var buf;
  if (obj instanceof Array) {
    buf = [];
    var i = Obj.length;
    while (i--) {
      buf[i] = clone(obj[i]);
    }
    return buf;
  }
  else if (obj instanceof Object) {
    buf = {};
    for (var k in obj) {
      buf[k] = clone(obj[k]);
    }
    return buf;
  } else {
    return obj;
  }

}

module.exports = {
  formatTime,
  clone
}
