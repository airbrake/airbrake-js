import {AirbrakeError} from '../notice';


export type Callback = (name: string, err: AirbrakeError) => void;

export type Processor = (err: Error, cb: Callback) => void;
export default Processor;
