import {GraphMl} from '../graph-ml.js';

document.body.appendChild(GraphMl.render([
  {
    t: 'span',
    s: {
      color: '#f00',
      fontSize: '40px',
      ':hover': {
        color: '#00f',
      }
    },
    p: {
      textContent: 'TEST',
    },
    f: (el) => {
      el.onclick = () => {
        el.remove();
      };
    },
    l: {
      connected: (el) => {
        console.log('connected!');
        console.log(el);
      },
      disconnected: (el) => {
        console.log('disconnected!');
        console.log(el);
      },
    }
  },
  {t:'br'},
  {t:'br'},
  {t:'br'},
  {
    c: [
      'Some text...'
    ],
    l: {
      connected: (el) => {
        console.dir(el)
      }
    }
  }
]))
