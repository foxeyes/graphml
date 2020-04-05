import {Component} from '../../../component.js'
import {StateMngr} from '../../../state.js'

const SIZE = 500
const STARTED = performance.now()

StateMngr.registerGlobal({
  name: 'John',
  secondName: 'Snow',
  age: 24
})

class UserCard extends Component {
  constructor() {
    super()
    this.setLocalStateScheme(this.localState.store)
  }
  connectedCallback() {
    super.connectedCallback()
    this.onclick = () => {
      this.localPub('name', 'Peter')
      this.localPub('secondName', 'Parker')
      this.localPub('age', 18)
      this.setAttribute('invert', '')
    }
  }
}
UserCard.template = /*html*/ `
  <div b-l="textContent:name"></div>
  <div b-l="textContent:secondName"></div>
  <div b-l="textContent:age"></div>`
UserCard.is = 'user-card'

class CommonContainer extends Component {
  constructor() {
    super()
    this.setLocalStateScheme(StateMngr.global.store)
  }
}
CommonContainer.template = /*html*/ `
<style>
user-card {
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
user-card:focus {
  box-shadow:0 0 12px rgba(0, 0, 0, 0.2);
  transform:scale(1.2);
}
user-card[invert] {
  filter: invert(1);
}
common-container {
  display:grid;
  grid-template-columns:1fr 1fr 1fr 1fr;
  grid-gap:10px;
  background-color:#eee;
  padding:40px;
}
</style>
${[...Array(SIZE)].map(() => /*html*/ `<user-card tabindex="0"></user-card>`).join('')}
`
CommonContainer.is = 'common-container'

window.onload = () => {
  window.requestAnimationFrame(() => {
    console.log('ANIMATION: ' + (performance.now() - STARTED))
  })
  // @ts-ignore
  window.requestIdleCallback(() => {
    console.log('IDLE: ' + (performance.now() - STARTED))
  })
}
