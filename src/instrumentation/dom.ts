import Client = require('../client');


const elemAttrs = ['type', 'name'];


function elemName(elem: HTMLElement): string {
    if (!elem) {
        return '';
    }

    let s: string[] = [];

    if (typeof elem.tagName === 'string') {
        s.push(elem.tagName.toLowerCase());
    }

    if (typeof elem.id === 'string' && elem.id !== '') {
        s.push('#');
        s.push(elem.id);
    }

    if (typeof elem.className === 'string' && elem.className !== '') {
        s.push('.');
        s.push(elem.className.split(' ').join('.'));
    }

    if (typeof elem.getAttribute === 'function') {
        for (let attr of elemAttrs) {
            let value = elem.getAttribute(attr);
            if (value) {
                s.push(`[${attr}="${value}"]`);
            }
        }
    }

    return s.join('');
}


function elemPath(elem: HTMLElement): string {
    const maxLen = 10;

    let path: string[] = [];

    while (elem) {
        let name = elemName(elem);
        if (name !== '') {
            path.push(name);
            if (path.length > maxLen) {
                break;
            }
        }
        elem = elem.parentNode as HTMLElement;
    }

    return path.reverse().join(' > ');
}

export function debounceEventHandler(fn: EventListener, timeout = 1500): EventListener {
    let timer: number;
    return function(event: Event): void {
        if (timer) {
            clearTimeout(timer);
        } else {
            fn(event);
        }
        timer = setTimeout(() => {
            timer = null;
        }, timeout);
    };
}

export function makeEventHandler(client: Client): EventListener {
    return function(event: Event): void {
        let target: HTMLElement;
        try {
            target = event.target as HTMLElement;
        } catch (_) {
            return;
        }

        let state: any = {type: event.type};

        try {
            state.target = elemPath(target);
        } catch (err) {
            state.target = `<${err.toString()}>`;
        }

        let kb = event as KeyboardEvent;
        if (kb.key) {
            state.key = kb.key;
        }

        client.pushHistory(state);
    };
}
