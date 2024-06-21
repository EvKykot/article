import { getAxiosGlobalConfig } from './axios';
import {HarryPotterType} from "../types/harryPotterTypes";

const axiosInstance = getAxiosGlobalConfig('https://hp-api.onrender.com/api/');

export const getHarryPotterList = async (): Promise<HarryPotterType[]> => axiosInstance.get(`characters`);

export const getHarryPotterCharacter = async (id: string): Promise<HarryPotterType[]> => axiosInstance.get(`character/${id}`);