import { useEffect, useRef, useState } from 'react'
import { 
  Card,
  Col,
  Row,
  Switch, 
  Slider 
} from 'antd'
import './App.css';

const RED = 160, GREEN = 160, BLUE = 160, BLUR = 6

function App() {
  const _video = useRef( null )
  const _stream = useRef( null )
  const _th = useRef( {r: RED, g: GREEN, b: BLUE, blur: BLUR, enable: true})


  const [ _status, setStatus ] = useState('INIT')
  const [ _detectChromakey, setDetectChromakey ] = useState( true )
  const [ _imgLen, setImgLen ] = useState( 0 )
  const [ _red, setRed ] = useState( RED )
  const [ _green, setGreen ] = useState( GREEN )
  const [ _blue, setBlue ] = useState( BLUE )
  const [ _blur, setBlur ] = useState( BLUR )

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

      const _lambda = () => {
        try {
          const w = video.videoWidth
          const h = video.videoHeight
          canvas.width = w
          canvas.height = h
          canvas2.width = w
          canvas2.height = h

          ctx.filter = 'blur(' + _th.current.blur + 'px)'
          ctx.drawImage( video, 0, 0, w, h )
          const img = ctx.getImageData( 0, 0, w, h )
          setImgLen( img.data.length )

          if( _th.current.enable ) {
            const len = w * h

            for( let i = 0; i < len; i++ ) {
              let _i = i << 2 // x 4
              const r = img.data[_i], g = img.data[_i+1], b = img.data[_i+2]
              const is_chroma = ( r < _th.current.r && g > _th.current.g && b < _th.current.b )

              img.data[_i] = is_chroma ? 255 : 0
              img.data[_i + 1] = is_chroma ? 255 : 0
              img.data[_i + 2] = is_chroma ? 255 : 0
            }
          }

          ctx2.putImageData( img, 0, 0 )
        } catch(e) {}

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
            <div>
              enable chromakey: 
              <Switch defaultChecked onChange={ val => {
                _th.current.enable = val
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
