import axios from "@/http/axios.ts";
import type { PageResponse } from "./user.ts";

export interface Permission {
    id: number;
    name: string;
    menuType: string;
    code: string;
    path: string;
    parentId: number;
    sort: number;
    createTime: Date;
}

export interface PermissionData {
    name: string;
    type: string;
    code: string;
    path: string;
    parentId: number;
    sort: number;
}

export const getPermissionList = (start: number, rows: number) => {
    return axios<PageResponse<Permission>>({
        url:'api/permission/getPermissionList',
        method: 'GET',
        params:{
            currentPage:start,
            rows:rows
        }
    })
}

export const savePermission = (data: PermissionData) => {
    return axios({
        url:'api/permission/savePermission',
        method: 'POST',
        data
    })
}

export const deletePermission = (id: number) => {
    return axios({
        url: `/api/permission/${id}`,
        method: 'DELETE'
    })
}

export const updatePermission = (id: number, data: PermissionData) => {
    return axios({
        url:`api/permission/${id}`,
        method: 'PUT',
        data
    })
}