import {NoticeError} from '../notice';


export type Processor = (err: Error) => NoticeError;
export default Processor;
