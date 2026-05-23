type VexflowModule = typeof import('vexflow');

let vexflowPromise: Promise<VexflowModule> | null = null;

export function loadVexflow(): Promise<VexflowModule> {
  if (vexflowPromise) {
    return vexflowPromise;
  }

  vexflowPromise = import('vexflow');
  return vexflowPromise;
}
