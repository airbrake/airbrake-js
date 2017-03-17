import Notice from '../notice';


export type Filter = (notice: Notice) => Notice | null;
export default Filter;
