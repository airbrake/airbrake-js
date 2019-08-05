import Notice from './notice';

export default interface INotifier {
  notify(err: any): Promise<Notice>;
}
