exports.parseCoords = function (coords) {
  let minmax = decodeURIComponent(coords).split(';')
  var res = minmax.map(s => s.split(',')).map(a => {return {lat:Number(a[0]), lon:Number(a[1])}})
  if (res.length != 2 || res.reduce((a, x) => a || isNaN(x.lat) || isNaN(x.lon), false))
    return null
  else
    return res
}