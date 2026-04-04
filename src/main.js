import { createApp } from 'vue'
import App from './view/App.vue'
// 导入 Element Plus
import ElementPlus from 'element-plus'
// 导入 Element Plus 样式文件（这步不写，表格就没有边框和样式）
import 'element-plus/dist/index.css'
import router from './router'

const app = createApp(App);

// 使用插件
app.use(router);
app.use(ElementPlus);
app.mount('#app');