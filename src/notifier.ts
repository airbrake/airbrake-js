import Notice from './notice';


export interface Notifier {
    notify(err: any): Promise<Notice>;
}
export default Notifier;
