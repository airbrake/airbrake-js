export interface AirbrakeFrame {
    function: string;
    file: string;
    line: number;
    column: number;
}

export interface AirbrakeError {
    type: string;
    message: string;
    backtrace: AirbrakeFrame[];
}

export interface Notice {
    id?: string;
    errors: AirbrakeError[];
    context?: any;
    params?: any;
    session?: any;
    environment?: any;
}

export default Notice;
