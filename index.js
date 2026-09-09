import { registerRootComponent } from 'expo';
import App from './App';

// registerRootComponent llama a AppRegistry.registerComponent('main', () => App);
// En entorno web, monta automáticamente el componente App en el DOM (document.getElementById('root'))
registerRootComponent(App);
