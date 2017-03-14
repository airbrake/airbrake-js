import Promise from './promise';


export interface Notifier {
    notify(err: any): Promise;
}
export default Notifier;
