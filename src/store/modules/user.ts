import { defineStore } from "pinia";
import { Storage } from "@/utils/Storage";


interface UserState{
    token: string;
    name?: string;
}

export const useUserStore = defineStore({
    id: "user",
    state: (): UserState => ({
        token: Storage.get('token'),
    }),

    getters: {
        getToken(): string {
            return this.token;
        },
    },


    actions: {
        // 清空token
        resetToken() {
            this.name = this.token = "";
        },
        //设置token
        setToken(token:string){
            this.token = token ?? "";
            Storage.set('token', token);
        }
    }
})