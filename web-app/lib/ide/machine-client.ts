export interface MachineSession {
  id: string;
  user_id: string;
  fly_machine_id: string;
  fly_region: string;
  status: string;
  private_ip: string;
  created_at: string;
  last_heartbeat: string;
  github_repo: string | null;
}

export async function getMachine(): Promise<MachineSession | null> {
  const res = await fetch('/api/ide/machines');
  if (!res.ok) return null;
  const { machine } = await res.json();
  return machine;
}

export async function createMachine(): Promise<MachineSession> {
  const res = await fetch('/api/ide/machines', { method: 'POST' });
  if (!res.ok) {
    const { error } = await res.json();
    throw new Error(error || 'Failed to create machine');
  }
  const { machine } = await res.json();
  return machine;
}

export async function destroyMachine(machineSessionId: string): Promise<void> {
  await fetch(`/api/ide/machines/${machineSessionId}`, { method: 'DELETE' });
}

export async function heartbeat(machineSessionId: string): Promise<void> {
  await fetch(`/api/ide/machines/${machineSessionId}`, { method: 'PATCH' });
}

export async function getWsToken(machineSessionId: string): Promise<{ token: string; wsUrl: string }> {
  const res = await fetch('/api/ide/ws-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ machineSessionId }),
  });
  if (!res.ok) {
    const { error } = await res.json();
    throw new Error(error || 'Failed to get WS token');
  }
  return res.json();
}
