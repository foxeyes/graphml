import {renderStruct} from '../../../graph-ml.js'
const SIZE = 500
const STARTED = performance.now()
const userCard = function(name, secondName, age) {
  return renderStruct([
    {
      s:{
        display:'inline-grid',
        gridGap:'10px',
        padding:'20px',
        borderRadius:'10px',
        backgroundColor:'#fff',
        color:'rgb(50, 50, 50)',
        transition:'0.2s',
        outline:'none',
        userSelect:'none',
        ':focus':{
          boxShadow:'0 0 12px rgba(0, 0, 0, 0.2)',
          transform:'scale(1.2)'
        }
      },
      a:{tabindex:0},
      c:[
        {c:['Name: '+name]},
        {c:['Second Name: '+secondName]},
        {c:['Age: '+age]}
      ]
    }
  ])
}
window.onload = () => {
  document.body.appendChild(renderStruct([
    {
      s:{
        display:'grid',
        gridTemplateColumns:'1fr 1fr 1fr 1fr',
        gridGap:'10px',
        backgroundColor:'#eee',
        padding:'40px'
      },
      c:[...Array(SIZE)].map(() => userCard('John','Snow',24))
    }
  ]))
  window.requestAnimationFrame(()=>{
    console.log('ANIMATION: '+(performance.now()-STARTED))
  })
  // @ts-ignore
  window.requestIdleCallback(()=>{
    console.log('IDLE: '+(performance.now()-STARTED))
  })
}
