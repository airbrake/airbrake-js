import { INotice } from '../notice';

export type Filter = (notice: INotice) => INotice | null;
