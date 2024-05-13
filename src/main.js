// import { createApp } from 'vue';
import './style.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import App from './App.vue';
import { createApp } from 'vue'
import { createPinia } from 'pinia';

// import { store } from './store/store';

const app = createApp(App)

app.use(createPinia())
// app.use(router)

app.mount('#app')
