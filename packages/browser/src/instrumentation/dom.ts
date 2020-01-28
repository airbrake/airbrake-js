import { Notifier } from '../notifier';

const elemAttrs = ['type', 'name', 'src'];

export function instrumentDOM(notifier: Notifier) {
  const handler = makeEventHandler(notifier);

  if (window.addEventListener) {
    window.addEventListener('load', handler);
    window.addEventListener(
      'error',
      (event: Event): void => {
        if (getProp(event, 'error')) {
          return;
        }
        handler(event);
      },
      true
    );
  }

  if (typeof document === 'object' && document.addEventListener) {
    document.addEventListener('DOMContentLoaded', handler);
    document.addEventListener('click', handler);
    document.addEventListener('keypress', handler);
  }
}

function makeEventHandler(notifier: Notifier): EventListener {
  return (event: Event): void => {
    let target = getProp(event, 'target') as HTMLElement | null;
    if (!target) {
      return;
    }

    let state: any = { type: event.type };

    try {
      state.target = elemPath(target);
    } catch (err) {
      state.target = `<${String(err)}>`;
    }

    notifier.scope().pushHistory(state);
  };
}

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

  if (elem.classList && Array.from) {
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
  if (name.baseVal && name.baseVal.split) {
    // SVGAnimatedString
    return name.baseVal.split(' ').join('.');
  }
  console.error('unsupported HTMLElement.className type', typeof name);
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

function getProp(obj: any, prop: string): any {
  try {
    return obj[prop];
  } catch (_) {
    // Permission denied to access property
    return null;
  }
}
