import * as vscode from 'vscode';

interface ValidateResponse {
  valid: boolean;
  plan: 'free' | 'pro';
  message?: string;
  expiresAt?: string;
}

export class LicenseManager {
  private static readonly KEY_SECRET = 'infinit.licenseKey';
  private _pro: boolean = false;
  private _apiBase: string;

  constructor(private context: vscode.ExtensionContext) {
    this._apiBase = vscode.workspace.getConfiguration('infinit').get('apiEndpoint') || 'https://app-infinitcode.netlify.app/api';
  }

  /** Called on extension activate — silently validates stored key */
  async checkOnStartup(): Promise<void> {
    const key = await this.context.secrets.get(LicenseManager.KEY_SECRET);
    if (!key) return;
    try {
      const result = await this._validateRemote(key);
      this._pro = result.valid && result.plan === 'pro';
      if (this._pro) {
        vscode.commands.executeCommand('setContext', 'infinit.isPro', true);
      }
    } catch {
      // offline — trust local cache
      const cached = this.context.globalState.get<boolean>('infinit.proCache', false);
      this._pro = cached;
    }
  }

  /** Activate a new license key */
  async activate(key: string): Promise<{ success: boolean; message: string }> {
    const trimmed = key.trim().toUpperCase();
    if (!trimmed.match(/^INFT-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/)) {
      return { success: false, message: 'Invalid key format. Expected: INFT-XXXX-XXXX-XXXX-XXXX' };
    }

    try {
      const result = await this._validateRemote(trimmed);
      if (result.valid && result.plan === 'pro') {
        await this.context.secrets.store(LicenseManager.KEY_SECRET, trimmed);
        await this.context.globalState.update('infinit.proCache', true);
        this._pro = true;
        return { success: true, message: 'License activated.' };
      } else {
        return { success: false, message: result.message || 'Key not valid for Pro plan.' };
      }
    } catch (err: any) {
      return { success: false, message: 'Could not reach validation server. Check your connection.' };
    }
  }

  isPro(): boolean {
    return this._pro;
  }

  async getKey(): Promise<string | undefined> {
    return this.context.secrets.get(LicenseManager.KEY_SECRET);
  }

  private async _validateRemote(key: string): Promise<ValidateResponse> {
    const res = await fetch(`${this._apiBase}/license/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, source: 'vscode-extension' }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({})) as any;
      throw new Error(err.message || `HTTP ${res.status}`);
    }

    return res.json() as Promise<ValidateResponse>;
  }
}
