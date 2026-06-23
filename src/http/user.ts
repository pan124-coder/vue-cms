
import axios from "@/http/axios.ts";

export interface PageResponse<T> {
  total: number;
  totalPage: number;
  data: T[];
}

export interface UserData {
  id: number;
  username: string;
  password: string;
  roleId: number;
  roleName?: string;
  createTime?: string;
  updateTime?: string;
}

export interface userData {
  name?: string;
  password: string;
  roleId?: number;
  username: string;
}

export const getUserList = (start: number, rows: number) => {
    return axios<PageResponse<UserData>>({
        url:'api/user/getUserList',
        method: 'GET',
        params:{
            currentPage:start,
            rows:rows
        }
    })
}

export const saveUser = (data: userData) => {
    return axios({
        url:'api/user/saveUser',
        method: 'POST',
        data
    })
}

export const deleteUser = (id: number) => {
    return axios({
        url: `/api/user/${id}`,
        method: 'DELETE'
    })
}

export const updateUser = (id: number, data: userData) => {
    return axios({
        url:`api/user/${id}`,
        method: 'PUT',
        data
    })
}