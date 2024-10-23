import { create } from "zustand";
import commonAxios from "../module/commonAxios";

export interface commonStateInterface {
  isLoading: boolean,
  currentMenuKey: number,
  setCurrentMenuKey: (param: number) => void,
  setIsLoading: (param :boolean) => void,
  commonAjaxWrapper: (method: string, url: string, data?: any, contentType?: string) => any
}


export const commonStateStore =  create<commonStateInterface>((set) => ({
  isLoading: false,
  currentMenuKey: -1,
  setCurrentMenuKey: (param: number) => {
    set(() => ({currentMenuKey: param}));
  },
  setIsLoading:(param: boolean) => {
    set(() => ({isLoading: param}));
  },
  async commonAjaxWrapper(method, url, data, contentType) {
    set(() => ({isLoading: true}));
    let res = null;
    if(contentType) {
      res = await commonAxios(method, url, data, contentType);
    } else {
      res = await commonAxios(method, url, data);
    }
    set(() => ({isLoading: false}));
    return res;
  },
}));