import {http} from "@/utils/http";

export const getWeatherData = (params?: object) => {
    return http.request({
        url: '/weather/now',
        method: 'get',
        params
    })
}

