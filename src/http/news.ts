import axios from "@/http/axios.ts";
import type { PageResponse } from "./user.ts";

export interface newsData {
    title: string;
    content: string;
    category: string;
    supplier?: string;
    reviewer?: string;
}

export interface NewsList {
    id: number;
    title: string;
    content: string;
    status: string;
    category: string;
    supplier: string;
    reviewer: string;
    publishTime: Date;
}

export const saveNews = (data: newsData) => {
    return axios({
        url:'api/news/savenews',
        method: 'POST',
        data
    })
}

export const newsList = (start: number, rows: number) => {
    return axios<PageResponse<NewsList>>({
        url:'api/news/newsList',
        method: 'GET',
        params:{
            currentPage:start,
            rows
        }
    })
}

export const deletenews = (id: number) => {
    return axios({
        url: `/api/news/${id}`,
        method: 'DELETE'
    })
}

export const updateNews = (id: number, data: newsData) => {
    return axios({
        url: `/api/news/${id}`,
        method: 'PUT',
        data
    })
}

export const auditPass = (id: number) => {
    return axios({
        url: `/api/news/auditPass/${id}`,
        method: 'PUT'
    })
}

export const auditReject = (id: number) => {
    return axios({
        url: `/api/news/auditReject/${id}`,
        method: 'PUT'
    })
}

export const getNewsById = (id: number) => {
    return axios({
        url: `/api/news/${id}`,
        method: 'GET'
    })
}

