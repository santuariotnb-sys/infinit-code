const FLY_API_URL = 'https://api.machines.dev/v1';
const FLY_API_TOKEN = process.env.FLY_API_TOKEN!;
const FLY_APP_NAME = process.env.FLY_APP_NAME || 'infinitcode-machines';

interface FlyMachine {
  id: string;
  name: string;
  state: string;
  region: string;
  private_ip: string;
  created_at: string;
}

async function flyFetch(path: string, options: RequestInit = {}): Promise<Response> {
  return fetch(`${FLY_API_URL}/apps/${FLY_APP_NAME}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${FLY_API_TOKEN}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
}

export async function createMachine(userId: string): Promise<FlyMachine> {
  const res = await flyFetch('/machines', {
    method: 'POST',
    body: JSON.stringify({
      name: `ide-${userId.slice(0, 8)}-${Date.now()}`,
      region: 'gru',
      config: {
        image: process.env.FLY_IMAGE_REF || `registry.fly.io/${FLY_APP_NAME}:deployment-01KMB1JDGBATC4BBHZZJX9B9Q5`,
        guest: {
          cpu_kind: 'shared',
          cpus: 1,
          memory_mb: 512,
        },
        services: [
          {
            ports: [{ port: 8080 }],
            protocol: 'tcp',
            internal_port: 8080,
          },
        ],
        auto_destroy: true,
        restart: { policy: 'no' },
        metadata: {
          user_id: userId,
        },
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to create machine: ${res.status} ${err}`);
  }

  return res.json();
}

export async function getMachine(machineId: string): Promise<FlyMachine> {
  const res = await flyFetch(`/machines/${machineId}`);
  if (!res.ok) throw new Error(`Machine not found: ${machineId}`);
  return res.json();
}

export async function stopMachine(machineId: string): Promise<void> {
  const res = await flyFetch(`/machines/${machineId}/stop`, { method: 'POST' });
  if (!res.ok) throw new Error(`Failed to stop machine: ${machineId}`);
}

export async function startMachine(machineId: string): Promise<void> {
  const res = await flyFetch(`/machines/${machineId}/start`, { method: 'POST' });
  if (!res.ok) throw new Error(`Failed to start machine: ${machineId}`);
}

export async function destroyMachine(machineId: string): Promise<void> {
  // Stop first, then destroy
  try { await stopMachine(machineId); } catch {}
  const res = await flyFetch(`/machines/${machineId}?force=true`, { method: 'DELETE' });
  if (!res.ok && res.status !== 404) {
    throw new Error(`Failed to destroy machine: ${machineId}`);
  }
}

export async function waitForMachine(machineId: string, state: string = 'started', timeoutMs: number = 60000): Promise<FlyMachine> {
  const res = await flyFetch(`/machines/${machineId}/wait?state=${state}&timeout=${timeoutMs / 1000}`);
  if (!res.ok) throw new Error(`Machine did not reach state ${state}`);
  return getMachine(machineId);
}
