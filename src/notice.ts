export interface NoticeFrame {
    function: string;
    file: string;
    line: number;
    column: number;
}

export interface NoticeError {
    type: string;
    message: string;
    backtrace: NoticeFrame[];
}

export interface Notice {
    id?: string;
    errors: NoticeError[];
    context?: any;
    params?: any;
    session?: any;
    environment?: any;
}

export default Notice;
