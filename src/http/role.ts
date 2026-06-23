

import axios from "@/http/axios.ts";
import type { PageResponse } from "./user.ts";

export interface RoleAuthorizePayload {
    roleId: number
    permissionIds: number[]
}

export interface Role {
    id: number;
    name: string;
}

export interface Permission {
    id: number;
    name: string;
    menuType: string;
    checked: boolean;
    children: Permission[];
    halfchecked: boolean;
    menuGranted: boolean;
    parentId: number;
}

export const authorizeRole = (data: RoleAuthorizePayload) => {
    return axios({
        url: '/api/role/authRole',
        method: 'POST',
        data
    })
}

export const getRoleList = (start: number, rows: number) => {
    return axios<PageResponse<Role>>({
        url: '/api/role/roleList',
        method: 'GET',
        params:{
            currentPage:start,
            rows
        }
    })
}

export const getAllPermission = () => {
    return axios<Permission[]>({
        url: '/api/role/getAllPermission',
        method: 'GET',
    })
}

export const getPermissionOfCurrentRole = (roleId: number) => {
    return axios<number[]>({
        url: '/api/role/getAllPermissionOfCurrentRole',
        method: 'GET',
        params: {
            roleId
        }
    })
}

export const saveRole = (data: any) => {
    return axios({
        url: '/api/role/saverole',
        method: 'POST',
        data
    })
}

export const updateRole = (id: number, data: any) => {
    return axios({
        url: `/api/role/${id}`,
        method: 'PUT',
        data
    })
}

export const deleteRole = (id: number) => {
    return axios({
        url:`/api/role/${id}`,
        method: 'DELETE'
    })
}
