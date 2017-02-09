import Notice from '../notice';


export type Filter = (notice: Notice) => Notice;
export default Filter;
