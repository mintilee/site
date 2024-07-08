// 默认缓存期限为7天
const CHCHE_TIME_DAY = import.meta.env.VITE_CHCHE_TIME ?? 7;

const DEFAULT_CHCHE_TIME = 60 * 60 * 24 * CHCHE_TIME_DAY;

// 默认 localStorage 存储
export const createCacheStorage = ({ prefixKey = "", useSessionStorage = false } = {}) => {
    const storage = useSessionStorage ? sessionStorage : localStorage;
	const Storage = class {
		private storage = storage;
		private prefixKey?:string = prefixKey;
		private getKey(key: string){
			return `${this.prefixKey}${key}`.toUpperCase();
		}
		// 设置
		set(key: string, value: any, expire: number | null = DEFAULT_CHCHE_TIME){
			const stringData = JSON.stringify({
				value,
				expire: expire !== null ? new Date().getTime() + expire * 1000 : null,
			});
			this.storage.setItem(this.getKey(key), stringData);
		}
		// 获取
		get<T = any>(key: string, def: any = null): T {
			const item = this.storage.getItem(this.getKey(key));
			if(item){
				try{
					const data = JSON.parse(item);
					const {value, expire} = data;
					if(expire === null || expire >= Date.now()){
						return value;
					}
					this.remove(this.getKey(key));
				}catch(e){
					return def;
				}
			}

			return def;
		}
		// 删除
		remove(key: string){
			this.storage.removeItem(this.getKey(key));
		}

		// 清理所有缓存
		clean(): void{
			this.storage.clean();
		}

		// 设置cookie
		setCookie(name: string, value: any, expire: number | null = DEFAULT_CHCHE_TIME){
			document.cookie = `${this.getKey(name)}=${value}; Max-Age=${expire}`;
		}
		// 获取cookie
		getCookie(name: string): string{
			const cookieArr = document.cookie.split('; ');
			for(let i = 0; length = cookieArr.length, i < length; i ++){
				const kv = cookieArr[i].split('=');
				if(kv[0] === this.getKey(name)){
					return kv[1];
				}
			}
			return '';
		}
		// 清理cookie
		cleanCookie(): void{
			 const keys = document.cookie.match(/[^ =;]+(?==)/g);
		     if (keys) {
		        for (let i = keys.length; i--; ) {
		          document.cookie = `${keys[i]}=0;expire=${new Date(0).toUTCString()}`;
		        }
		     }
		}
	}
	return new Storage();
};


export const Storage = createCacheStorage();

export default Storage;
























