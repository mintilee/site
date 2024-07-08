import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv,ConfigEnv,UserConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import path from 'path'
import {createHtmlPlugin} from 'vite-plugin-html'
import Components from "unplugin-vue-components/vite";
import { VantResolver } from "unplugin-vue-components/resolvers";
import viteCompression from "vite-plugin-compression";


// https://vitejs.dev/config/
// 获取当前目录的路径
const root: string = process.cwd();
export default defineConfig(({ command, mode }: ConfigEnv): UserConfig => {
  // 获取环境变量
  const {VITE_BASE_API, VITE_ENABLE_ERUDA, VITE_PUBLIC_PATH, VITE_DROP_CONSOLE, VITE_ROUTER_MODE, VITE_BASE_PATH, VITE_SERVER_PORT} = loadEnv(mode, root);
  return {
    base: VITE_PUBLIC_PATH || "/",
    plugins:[
      vue(),
      vueJsx(),
      // vant 组件自动按需引入
      Components({
        dts: "src/typings/components.d.ts",
        resolvers: [VantResolver()]
      }),
      // 注册模板数据
      createHtmlPlugin({
        inject: {
          data: {
            ENABLE_ERUDA: VITE_ENABLE_ERUDA || "false"
          }
        }
      }),
      // 生产环境gzip压缩资源
      viteCompression(),
      ],
    resolve:{
      alias:{
        '@': path.resolve(__dirname, 'src'),
      },
      extensions:['.js', '.jsx', '.ts','.tsx','.mjs'], // 扩展之所以加入.mjs 查看vant/es里面有.mjs 所以此处需要加上.mjs
    },

    esbuild:{
      pure: VITE_DROP_CONSOLE ? ["console.log", "debugger"] : []
    },

    server:{
      port: 3000,
      host: '0.0.0.0', // 支持IP启动
      open: true,
       // target: `${process.env.VITE_BASE_PATH}:${process.env.VITE_SERVER_PORT}/`, // 代理到 目标路径
      proxy: {
        // 把key的路径代理到target位置
        // detail: https://cli.vuejs.org/config/#devserver-proxy
        [VITE_BASE_API]: { // 需要代理的路径   例如 '/api'
          target: `${VITE_BASE_PATH}:${VITE_SERVER_PORT}/`, // 代理到 目标路径
          changeOrigin: true,
          ws: true,
          rewrite: path => path.replace(new RegExp('^' + VITE_BASE_API), ''),
        }
      },
    },

    build:{
      outDir: "dist",
      minify: "terser",
      terserOptions:{
        compress:{
          keep_infinity: true, // 防止 Infinity 被压缩成 1/0，这可能会导致 Chrome 上的性能问题
          // drop_console: env.VITE_DROP_CONSOLE || false,
          drop_console: Object.is(VITE_DROP_CONSOLE, 'true'),
          drop_debugger: true
        }
      },
      chunkSizeWarningLimit: 1500,
      rollupOptions:{
        output:{
          chunkFileNames: "static/js/[name]-[hash].js",
          entryFileNames: "static/js/[name]-[hash].js",
          assetFileNames: "static/[ext]/[name]-[hash].[ext]"
        }
      }
    }
  }
})

// 详细的配置 可以参照这位https://juejin.cn/post/7320169904342515764

