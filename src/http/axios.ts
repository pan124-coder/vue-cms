import axios from "axios";
import type { AxiosRequestConfig } from "axios";
import {useUserStore} from "@/stores/user.ts";
import {ElMessage} from "element-plus";

const instance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 5000,
});

instance.interceptors.request.use((config) => {
    const userStore = useUserStore();
    if (userStore.token) {
        config.headers['schoolName'] = 'guet';
        config.headers['Authorization'] = `Bearer ${userStore.token}`;
    }
    if (config.method?.toLowerCase() !== 'get') {
        config.headers['Content-Type'] = 'application/json;charset=UTF-8';
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

instance.interceptors.response.use(
    (response) => {
        const res = response.data;

        if (res.code === 403) {
            ElMessage.error(res.message || '权限不足，无法操作');
            return Promise.reject(new Error(res.message || 'Forbidden'));
        }

        if (res.total && res.data) {
            return res;
        }

        if (res.code !== undefined) {
            if (res.code !== 200) {
                ElMessage.warning(res.message || '操作失败');
                return Promise.reject(res);
            }
        }

        return res;
    },
    (error) => {
        if (error.response) {
            switch (error.response.status) {
                case 401:
                    ElMessage.error("登录状态失效，请重新登录");
                    const userStore = useUserStore();
                    userStore.logout();
                    window.location.href = '/login';
                    break;
                case 403:
                    ElMessage.error("对不起，您没有权限执行此操作");
                    break;
                case 500:
                    ElMessage.error("服务器开小差了，请稍后再试");
                    break;
                default:
                    ElMessage.error(error.response.data?.message || "网络错误");
            }
        } else {
            ElMessage.error("连接服务器失败");
        }
        return Promise.reject(error);
    }
);

export default function request<T = any>(options: AxiosRequestConfig): Promise<T> {
    return instance(options) as Promise<T>;
}
