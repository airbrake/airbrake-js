export const replaceTemplate = (templateString: string, params?: {[key: string]: string | number}): string => (
  templateString.replace(/\{([^\}]+)\}/g, (_: string, param: string) => {
    if (!params || typeof params[param] === 'undefined') {
      throw new Error(`airbrake: Missing value for parameter "${param}".`);
    }
    return String(params[param]);
  })
);