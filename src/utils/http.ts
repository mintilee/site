

import { useUserStore } from "@/store/modules/user";
// import axios, { AxiosResponse, AxiosRequestConfig, AxiosInstance, AxiosError, Axios } from 'axios';

import Axios, {
    type AxiosInstance,
    type AxiosError,
    type AxiosResponse,
    type AxiosRequestConfig
  } from "axios";
  
  
import router from "@/router";
import { Toast, closeToast, showFailToast, showToast } from "vant";

const httpConfig = {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'},
    timeout: 10000,
    baseURL: import.meta.env.VITE_BASE_PATH,
    withCredentials: false, // send cookies when cross-domain requests
    data:{},
}

class Http{
    // 当前实例
    private static axiosInstance: AxiosInstance;
    // 请求配置
    private static axiosRequestConfig: AxiosRequestConfig;


    //请求拦截
    private httpInterceptorsRequest(): void{
        Http.axiosInstance.interceptors.request.use(
            config => {
                const userStore = useUserStore();
                if (userStore.token && config.headers) {
                    config.headers['Authorization'] = userStore.token;
                }
                return config;
            }, (error: AxiosError) => {
                showFailToast(error.message);
                return Promise.reject(error);
            }
        )
    }

    // 响应拦截

    private httpInterceptorsResponse(): void {
        Http.axiosInstance.interceptors.response.use(

            (response: AxiosResponse) => { 
                closeToast(true);
                const {code, data, msg } = response.data;
                if (code && code !== 200) {
                    // 登陆超时
                    if (code === 401) {
                        router.replace('/error');
                    } else {
                        showToast(msg || '服务器访问出错了~');
                    }
                    return Promise.reject(response || 'error');
                } else {
                    return Promise.resolve(data)
                }
            },
            (error: AxiosError) => {
                let message = "";
                const status = error.response?.status;
                switch (status) {
                case 400:
                    message = "请求错误";
                    break;
                case 401:
                    message = "未授权，请登录";
                    break;
                case 403:
                    message = "拒绝访问";
                    break;
                case 404:
                    message = `请求地址出错: ${error.response?.config?.url}`;
                    break;
                case 408:
                    message = "请求超时";
                    break;
                case 500:
                    message = "服务器内部错误";
                    break;
                case 501:
                    message = "服务未实现";
                    break;
                case 502:
                    message = "网关错误";
                    break;
                case 503:
                    message = "服务不可用";
                    break;
                case 504:
                    message = "网关超时";
                    break;
                case 505:
                    message = "HTTP版本不受支持";
                    break;
                default:
                    message = "网络连接故障";
                }

                showFailToast(message);
                return Promise.reject(error);
            }
        )
    }

    constructor(config: AxiosRequestConfig) { 
        Http.axiosRequestConfig = config;
        Http.axiosInstance = Axios.create(config);
        this.httpInterceptorsRequest();
        this.httpInterceptorsResponse();
    }

    // 请求函数
    public request<T>(paramConfig: AxiosRequestConfig): Promise<T> {
        const config = { ...Http.axiosRequestConfig, ...paramConfig };
        console.log(config,"<====AxiosProxyConfig=======config=====>");
        return new Promise((resolve, reject) => {
          Http.axiosInstance
            .request(config)
            .then((response: any) => {
              resolve(response);
            })
            .catch(error => {
              reject(error);
            });
        });
      }
}


export const http = new Http(httpConfig);