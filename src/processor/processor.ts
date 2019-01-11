import { INoticeError } from '../notice';

export type Processor = (err: Error) => INoticeError;
export default Processor;
