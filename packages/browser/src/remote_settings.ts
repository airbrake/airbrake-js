import { makeRequester, Requester } from './http_req';
import { IOptions } from './options';
import { NOTIFIER_NAME, NOTIFIER_VERSION } from './version';

// API version to poll.
const API_VER = '2020-06-18';

// How frequently we should poll the config API.
const DEFAULT_INTERVAL = 600000; // 10 minutes

const NOTIFIER_INFO = {
  notifier_name: NOTIFIER_NAME,
  notifier_version: NOTIFIER_VERSION,
  os:
    typeof window !== 'undefined' &&
    window.navigator &&
    window.navigator.userAgent
      ? window.navigator.userAgent
      : undefined,
  language: 'JavaScript',
};

// Remote config settings.
const ERROR_SETTING = 'errors';
const APM_SETTING = 'apm';

interface IRemoteConfig {
  project_id: number;
  updated_at: number;
  poll_sec: number;
  config_route: string;
  settings: IRemoteConfigSetting[];
}

interface IRemoteConfigSetting {
  name: string;
  enabled: boolean;
  endpoint: string;
}

type Entries<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T][];

export class RemoteSettings {
  _opt: IOptions;
  _requester: Requester;
  _data: SettingsData;
  _origErrorNotifications: boolean;
  _origPerformanceStats: boolean;

  constructor(opt: IOptions) {
    this._opt = opt;
    this._requester = makeRequester(opt);

    this._data = new SettingsData(opt.projectId, {
      project_id: null,
      poll_sec: 0,
      updated_at: 0,
      config_route: '',
      settings: [],
    });

    this._origErrorNotifications = opt.errorNotifications;
    this._origPerformanceStats = opt.performanceStats;
  }

  poll(): any {
    // First request is immediate. When it's done, we cancel it since we want to
    // change interval time to the default value.
    const pollerId = setInterval(() => {
      this._doRequest();
      clearInterval(pollerId);
    }, 0);

    // Second fetch is what always runs in background.
    return setInterval(this._doRequest.bind(this), DEFAULT_INTERVAL);
  }

  _doRequest(): void {
    this._requester(this._requestParams(this._opt))
      .then((resp) => {
        this._data.merge(resp.json);

        this._opt.host = this._data.errorHost();
        this._opt.apmHost = this._data.apmHost();

        this._processErrorNotifications(this._data);
        this._processPerformanceStats(this._data);
      })
      .catch((_) => {
        return;
      });
  }

  _requestParams(opt: IOptions): any {
    return {
      method: 'GET',
      url: this._pollUrl(opt),
      headers: {
        Accept: 'application/json',
        'Cache-Control': 'no-cache,no-store',
      },
    };
  }

  _pollUrl(opt: IOptions): string {
    const url = this._data.configRoute(opt.remoteConfigHost);
    let queryParams = '?';

    for (const [key, value] of this._entries(NOTIFIER_INFO)) {
      queryParams += `&${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    }

    return url + queryParams;
  }

  _processErrorNotifications(data: SettingsData): void {
    if (!this._origErrorNotifications) {
      return;
    }
    this._opt.errorNotifications = data.errorNotifications();
  }

  _processPerformanceStats(data: SettingsData): void {
    if (!this._origPerformanceStats) {
      return;
    }
    this._opt.performanceStats = data.performanceStats();
  }

  // Polyfill from:
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries#polyfill
  _entries<T>(obj: T): Entries<T> {
    const ownProps = Object.keys(obj);
    let i = ownProps.length;
    const resArray = new Array(i);

    while (i--) resArray[i] = [ownProps[i], obj[ownProps[i]]];

    return resArray;
  }
}

export class SettingsData {
  _projectId: number;
  _data: IRemoteConfig;

  constructor(projectId: number, data: IRemoteConfig) {
    this._projectId = projectId;
    this._data = data;
  }

  merge(other: IRemoteConfig) {
    this._data = { ...this._data, ...other };
  }

  configRoute(remoteConfigHost: string): string {
    const host = remoteConfigHost.replace(/\/$/, '');
    const configRoute = this._data.config_route;

    if (
      configRoute === null ||
      configRoute === undefined ||
      configRoute === ''
    ) {
      return `${host}/${API_VER}/config/${this._projectId}/config.json`;
    } else {
      return `${host}/${configRoute}`;
    }
  }

  errorNotifications(): boolean {
    const s = this._findSetting(ERROR_SETTING);
    if (s === null) {
      return true;
    }

    return s.enabled;
  }

  performanceStats(): boolean {
    const s = this._findSetting(APM_SETTING);
    if (s === null) {
      return true;
    }

    return s.enabled;
  }

  errorHost(): string {
    const s = this._findSetting(ERROR_SETTING);
    if (s === null) {
      return null;
    }

    return s.endpoint;
  }

  apmHost(): string {
    const s = this._findSetting(APM_SETTING);
    if (s === null) {
      return null;
    }

    return s.endpoint;
  }

  _findSetting(name: string): IRemoteConfigSetting {
    const settings = this._data.settings;
    if (settings === null || settings === undefined) {
      return null;
    }

    const setting = settings.find((s) => {
      return s.name === name;
    });

    if (setting === undefined) {
      return null;
    }

    return setting;
  }
}
