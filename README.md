基于http://lib.cvtsp.com/video/CVNetVideoJs/1.3.0/CvNetVideo.js，进行了如下的修改
- 20250703：修复录屏问题：修复实时录屏有时下载后文件大小为0，修复视频回放点击结束录屏后没反应。
- 20250704：资源链接改成本地，可支持离线版部署

# 版本信息
## 20250703，初始版本信息：
- CvNetVideo.js：1.3.0, http://lib.cvtsp.com/video/CVNetVideoJs/1.3.0/CvNetVideo.js
- libffmpeg.js：1.39, https://lib.cvtsp.com/video/CVNetVideoJs/libffmpeg/1.39/libffmpeg.js
- CVNetVideo.css：1.3.0,https://lib.cvtsp.com/video/CVNetVideoJs/1.3.0/CVNetVideo.css
- EncodeAudioWorker.js：1.3.0, https://lib.cvtsp.com/video/CVNetVideoJs/1.3.0/EncodeAudioWorker.js
- DecodeAudioWorker.js：1.3.0, https://lib.cvtsp.com/video/CVNetVideoJs/1.3.0/DecodeAudioWorker.js
- DecodeVideoWorker.js：1.3.0,https://lib.cvtsp.com/video/CVNetVideoJs/1.3.0/DecodeVideoWorker.js
- loading.gif: http://lib.cvtsp.com/video/CVNetVideoJs/1.3.0/img/VideoPlayer/loading.gif
- videoplayer_button.png：http://lib.cvtsp.com/video/CVNetVideoJs/1.3.0/img/VideoPlayer/videoplayer_button.png
- libffmpeg.wasm：https://lib.cvtsp.com/video/CVNetVideoJs/libffmpeg/1.39/libffmpeg.wasm

# 使用方式
一、安装
```
npm i rtvs
```
二、vite配置
1、禁止vite优化rtvs
```
import { defineConfig } from 'vite';

export default defineConfig({
  optimizeDeps: {
    exclude: ['rtvs'], // 禁止 Vite 优化 rtvs
  },
});
```
2、将node_modules拷贝到resource
```
pnpm add -D vite-plugin-static-copy
```
```
/**
 * 资源拷贝
 *
 */
import type { PluginOption } from 'vite'

export async function configCopyPlugin() {
  const { viteStaticCopy } = await import('vite-plugin-static-copy')
  const copyPlugin: PluginOption[] = viteStaticCopy({
    targets: [
      {
        src: 'node_modules/rtvs/dist/1.3.0/**/*',
        dest: 'resource/rtvs/1.3.0'
      }
    ]
  })
  return copyPlugin
}
```
```
import { configCopyPlugin } from './copy'

export async function createVitePlugins(viteEnv: ViteEnv, isBuild: boolean) {
  vitePlugins.push(configCopyPlugin())
}
```
三、项目引入
```
const appendScript = (url) => {
  const script = document.createElement('script')
  script.src = url
  script.onload = () => {
    console.log('脚本加载完成！')
  }
  script.onerror = () => {
    console.error('脚本加载失败！')
  }
  document.head.appendChild(script)
}
appendScript('resource/rtvs/1.3.0/CvNetVideo.js')
```



