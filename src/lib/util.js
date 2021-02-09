export function add( a, b ) {
  return ( a + b )
}

/**
 * 四角形の頂点順序を正規化する
 * @params {Array<Array<Number>>} - e.g. [[5,1],[1,2],]2,8],[6,7]]
 * @return {Object}
 * @sample
 * 
 * ```
 * normalizeSquareApex( [[5,1],[1,2],[2,8],[6,7]] )
 *  #=> {ox: 1, oy: 2, theta: 0.17, w: 4.12, h: 6.08}
 * ```
 * 
 */
export function getSquare( arr ) {
  const [ _p0, _p1, _p2, _p3 ] = arr
  const r0 = Math.sqrt( Math.pow( (_p3[0] - _p0[0]), 2 ) + Math.pow( (_p3[1] - _p0[1]), 2 ) )
  const r1 = Math.sqrt( Math.pow( (_p1[0] - _p0[0]), 2 ) + Math.pow( (_p1[1] - _p0[1]), 2 ) )
  const b = _p3[0] - _p0[0]
  const theta = Math.acos( b / r0 )
  const flag = theta > ( Math.PI / 4 )
  const _ox = flag ? _p1[0] : _p0[0]
  const _oy = flag ? _p1[1] : _p0[1]
  const _theta = flag ? ( Math.PI / 2 ) - theta : -theta
  const _w = flag ? r1 : r0
  const _h = flag ? r0 : r1

  return {
    ox: _ox,
    oy: _oy,
    theta: Math.round( _theta * 100 ) / 100,
    w: Math.round( _w * 100 ) / 100,
    h: Math.round( _h * 100 ) / 100,
  }
}