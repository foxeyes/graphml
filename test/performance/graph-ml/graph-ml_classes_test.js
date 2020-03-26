import {GraphMl} from '../../../graph-ml.js'
const SIZE = 500
const STARTED = performance.now()
const px = 'uploadcare_';
const STYLES = /*css*/ `
.${px}user-card {
  display:inline-grid;
  grid-gap:10px;
  padding:20px;
  border-radius:10px;
  background-color:#fff;
  color:rgb(50, 50, 50);
  transition:.2s;
  outline:none;
  user-select:none;
}
.${px}user-card:focus {
  box-shadow:0 0 12px rgba(0, 0, 0, 0.2);
  transform:scale(1.2);
}
.${px}container {
  display:grid;
  grid-template-columns:1fr 1fr 1fr 1fr;
  grid-gap:10px;
  background-color:#eee;
  padding:40px;
}`
const userCard = function(name, secondName, age) {
  return GraphMl.render([
    {
      a:{tabindex:0,class:px+'user-card'},
      c:[
        {c:['Name: '+name]},
        {c:['Second Name: '+secondName]},
        {c:['Age: '+age]}
      ]
    }
  ])
}
window.onload = () => {
  document.body.appendChild(GraphMl.render([
    {
      t:'style',
      c:[STYLES]
    },
    {
      a:{class: px + 'container'},
      c:[...Array(SIZE)].map(() => userCard('John','Snow',24))
    }
  ]))
  // @ts-ignore
  window.requestIdleCallback(() => {
    console.log(performance.now()-STARTED)
  })
}
