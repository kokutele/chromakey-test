import { useEffect, useRef, useState } from 'react'
import { 
  Card,
  Col,
  Row,
  Switch, 
  Slider 
} from 'antd'
import './App.css';

const RED = 160, GREEN = 160, BLUE = 160, BLUR = 6, POINT = { x: -1, y: -1 }

function App() {
  const _video = useRef( null )
  const _stream = useRef( null )
  const _th = useRef( {r: RED, g: GREEN, b: BLUE, blur: BLUR, enable: true})
  const _debug = useRef( false )


  const [ _status, setStatus ] = useState('INIT')
  const [ _detectChromakey, setDetectChromakey ] = useState( true )
  const [ _imgLen, setImgLen ] = useState( 0 )
  const [ _red, setRed ] = useState( RED )
  const [ _green, setGreen ] = useState( GREEN )
  const [ _blue, setBlue ] = useState( BLUE )
  const [ _blur, setBlur ] = useState( BLUR )
  const [ _p0, setP0 ] = useState( POINT )
  const [ _p1, setP1 ] = useState( POINT )
  const [ _p2, setP2 ] = useState( POINT )
  const [ _p3, setP3 ] = useState( POINT )

  const isChromaKey = ( r, g, b ) => {
    return ( r < _th.current.r && g > _th.current.g && b < _th.current.b )
  }

  useEffect( () => {
    (async () => {
      const stream = await navigator.mediaDevices.getUserMedia({video: true, audio: false}) 
      _stream.current = stream
      setStatus( 'GOT_CAM_STREAM' )
    })()
  }, [])

  useEffect( () => {
    if( _status === 'GOT_CAM_STREAM' ) {
      const video = document.createElement('video')
      video.srcObject = _stream.current
      video.onloadedmetadata = () => {
        video.play()
      }

      const canvas = document.createElement( 'canvas' )
      const ctx = canvas.getContext('2d')
      const canvas2 = document.createElement( 'canvas' )
      const ctx2 = canvas2.getContext('2d')

      const tmp = { p0: null, p1: null, p2: null, p3: null, img: null, w: 0, h: 0 }

      const _lambda = () => {
        try {
          tmp.w = video.videoWidth
          tmp.h = video.videoHeight

          if( tmp.w === 0 || tmp.h === 0 ) {
            requestAnimationFrame( _lambda )
            return
          }

          canvas.width   = tmp.w
          canvas.height  = tmp.h
          canvas2.width  = tmp.w
          canvas2.height = tmp.h

          ctx.filter = 'blur(' + _th.current.blur + 'px)'
          ctx.drawImage( video, 0, 0, tmp.w, tmp.h )
          tmp.img = ctx.getImageData( 0, 0, tmp.w, tmp.h )
          setImgLen( tmp.img.data.length )

          let x = 0, y = 0
          const chromaArray = []
          if( _th.current.enable ) {
            const len = tmp.w * tmp.h

            for( let i = 0; i < len; i++ ) {
              let _i = i << 2 // x 4
              const r = tmp.img.data[ _i ], g = tmp.img.data[ _i + 1 ], b = tmp.img.data[ _i + 2 ]
              const is_chroma = isChromaKey( r, g, b )

              if( x === 0 ) {
                chromaArray[y] = []
              }
              chromaArray[y].push( is_chroma )

              if( x < ( tmp.w - 1 ) ) {
                x++
              } else {
                x = 0
                y++
              }
              if( true ) {
                tmp.img.data[_i] = is_chroma ? 255 : 0
                tmp.img.data[_i + 1] = is_chroma ? 255 : 0
                tmp.img.data[_i + 2] = is_chroma ? 255 : 0
              }
            }

            let sum, clen = 50, _is_chroma
            tmp.p0 = null
            tmp.p1 = null
            tmp.p2 = null
            tmp.p3 = null

            for( let _y = 0; _y < (tmp.h - clen); _y++ ) {
              for( let _x = 0; _x < tmp.w; _x++ ) {
                if( !tmp.p0 ) {
                  if( chromaArray[_y][_x]) {
                    sum = 0;_is_chroma = false
                    for( let j = 0; j < clen; j++ ) {
                      _is_chroma = chromaArray[_y + j][_x]
                      sum += _is_chroma ? 1 : 0
                    }
                    if ( sum === clen ) tmp.p0 = {x: _x, y: _y}
                  }
                }

                if( !tmp.p2 ) {
                  if( chromaArray[tmp.h - _y - 1][_x]) {
                    sum = 0; _is_chroma = false
                    for( let j = 0; j < clen; j++ ) {
                      _is_chroma = chromaArray[tmp.h - _y - 1][_x]
                      sum += _is_chroma ? 1 : 0
                    }
                    if ( sum === clen ) tmp.p2 = {x: _x, y: (tmp.h - _y - 1) }
                  }
                }
              }
            }

            for( let _x = 0; _x < ( tmp.w - clen ) ; _x++ ) {
              for( let _y = 0; _y < tmp.h; _y++ ) {
                if( !tmp.p1 ) {
                  if( chromaArray[_y][_x]) {
                    sum = 0;_is_chroma = false
                    for( let j = 0; j < clen; j++ ) {
                      _is_chroma = chromaArray[_y][_x + j]
                      sum += _is_chroma ? 1 : 0
                    }
                    if ( sum === clen ) tmp.p1 = {x: _x, y: _y}
                  }
                }
                if( !tmp.p3 ) {
                  if( chromaArray[_y][tmp.w - _x - 1]) {
                    sum = 0;_is_chroma = false
                    for( let j = 0; j < clen; j++ ) {
                      _is_chroma = chromaArray[_y][tmp.w - _x - 1 - j]
                      sum += _is_chroma ? 1 : 0
                    }
                    if ( sum === clen ) tmp.p3 = {x: tmp.w - _x - 1, y: _y }
                  }
                }
              }
            }
            if( tmp.p0 ) { setP0( tmp.p0 ) }
            if( tmp.p1 ) { setP1( tmp.p1 ) }
            if( tmp.p2 ) { setP2( tmp.p2 ) }
            if( tmp.p3 ) { setP3( tmp.p3 ) }

            if( _debug.current ) {
              ctx2.putImageData( tmp.img, 0, 0 )
            } else {
              ctx2.drawImage( video, 0, 0, tmp.w, tmp.h )
            }

            ctx2.fillStyle = 'red'
            if( tmp.p0 && tmp.p0.x > 0 && tmp.p0.y > 0 ) ctx2.fillRect( tmp.p0.x - 8, tmp.p0.y - 8, 16, 16)
            if( tmp.p1 && tmp.p1.x > 0 && tmp.p1.y > 0 ) ctx2.fillRect( tmp.p1.x - 8, tmp.p1.y - 8, 16, 16)
            if( tmp.p2 && tmp.p2.x > 0 && tmp.p2.y > 0 ) ctx2.fillRect( tmp.p2.x - 8, tmp.p2.y - 8, 16, 16)
            if( tmp.p3 && tmp.p3.x > 0 && tmp.p3.y > 0 ) ctx2.fillRect( tmp.p3.x - 8, tmp.p3.y - 8, 16, 16)
          } else {
            ctx2.drawImage( video, 0, 0, tmp.w, tmp.h )
          }
        } catch(e) {
          throw e
        }


        requestAnimationFrame( _lambda )
      }

      const stream = canvas2.captureStream(30)
      _video.current.srcObject = stream

      _lambda()

      setStatus('READY')
    }
  }, [ _status ])


  return (
    <div className="App">
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <div>status: {_status} </div>
            <div>length of image data: {_imgLen} </div>
            <div>p0: ({_p0.x}, {_p0.y}) </div>
            <div>p1: ({_p1.x}, {_p1.y}) </div>
            <div>p2: ({_p2.x}, {_p2.y}) </div>
            <div>p3: ({_p3.x}, {_p3.y}) </div>
            <div>
              enable chromakey: 
              <Switch defaultChecked onChange={ val => {
                _th.current.enable = val
              }}></Switch>
            </div>
            <div>
              debug: 
              <Switch defaultChecked={false} onChange={ val => {
                _debug.current=val
              }}></Switch>
            </div>
            <div>
              red {_red} : <Slider min={0} max={255} value={ _red } onChange={ val => {
                setRed( val )
                _th.current.r = val 
              }} />
              green {_green} : <Slider min={0} max={255} value={ _green } onChange={ val => {
                setGreen( val )
                _th.current.g = val 
              }} />
              blue {_blue} : <Slider min={0} max={255} value={ _blue } onChange={ val => {
                setBlue( val )
                _th.current.b = val 
              }} />
              blur {_blur} : <Slider min={0} max={16} value={ _blur } onChange={ val => {
                setBlur( val )
                _th.current.blur = val 
              }} />
            </div>
          </Card>
        </Col>
        <Col span={18}>
          <Card>
            <video
              ref={ e => _video.current = e }
              autoPlay
              muted
              playsInline
            ></video>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default App;
