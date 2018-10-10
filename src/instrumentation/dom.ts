import {Historian} from '../historian';


const elemAttrs = ['type', 'name', 'src'];


function elemName(elem: HTMLElement): string {
    if (!elem) {
        return '';
    }

    let s: string[] = [];

    if (elem.tagName) {
        s.push(elem.tagName.toLowerCase());
    }

    if (elem.id) {
        s.push('#');
        s.push(elem.id);
    }

    if (elem.classList) {
        s.push('.');
        s.push(Array.from(elem.classList).join('.'));
    } else if (elem.className) {
        let str = classNameString(elem.className);
        if (str !== '') {
            s.push('.');
            s.push(str);
        }
    }

    if (elem.getAttribute) {
        for (let attr of elemAttrs) {
            let value = elem.getAttribute(attr);
            if (value) {
                s.push(`[${attr}="${value}"]`);
            }
        }
    }

    return s.join('');
}

function classNameString(name: any): string {
    if (name.split) {
        return name.split(' ').join('.');
    }
    if (name.baseVal && name.baseVal.split) { // SVGAnimatedString
        return name.baseVal.split(' ').join('.');
    }
    console.log('unsupported HTMLElement.className type',
                typeof(name));
    return '';
}

function elemPath(elem: HTMLElement): string {
    const maxLen = 10;

    let path: string[] = [];

    let parent = elem;
    while (parent) {
        let name = elemName(parent);
        if (name !== '') {
            path.push(name);
            if (path.length > maxLen) {
                break;
            }
        }
        parent = parent.parentNode as HTMLElement;
    }

    if (path.length === 0) {
        return String(elem);
    }

    return path.reverse().join(' > ');
}

export function makeEventHandler(client: Historian): EventListener {
    return function(event: Event): void {
        let target: HTMLElement;
        try {
            target = event.target as HTMLElement;
        } catch (_) {
            return;
        }
        if (!target) {
            return;
        }

        let state: any = {type: event.type};

        try {
            state.target = elemPath(target);
        } catch (err) {
            state.target = `<${err.toString()}>`;
        }

        client.pushHistory(state);
    };
}
