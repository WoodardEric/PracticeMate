import type { PermissionState } from '../types/music';

interface StatusBannerProps {
  permission: PermissionState;
  tunerListening: boolean;
  metronomeRunning: boolean;
}

function statusCopy(permission: PermissionState, tunerListening: boolean, metronomeRunning: boolean) {
  if (permission === 'requesting') {
    return 'Requesting microphone access for the tuner.';
  }

  if (permission === 'denied') {
    return 'Microphone access was denied. The tuner needs mic permission, but the metronome still works.';
  }

  if (permission === 'unsupported') {
    return 'This browser does not expose microphone or Web Audio support needed for the tuner.';
  }

  if (permission === 'error') {
    return 'The tuner could not start. Check microphone availability and browser permissions.';
  }

  if (tunerListening) {
    return metronomeRunning
      ? 'Tuner and metronome are both active.'
      : 'Tuner is listening. Play a steady pitch to lock the note.';
  }

  if (metronomeRunning) {
    return 'Metronome is active. The tuner will ask for the microphone only when you start it.';
  }

  return 'This app runs entirely in the browser. The tuner requests the microphone only when you start listening.';
}

export function StatusBanner({
  permission,
  tunerListening,
  metronomeRunning,
}: StatusBannerProps) {
  const tone =
    permission === 'denied' || permission === 'unsupported' || permission === 'error'
      ? 'warning'
      : tunerListening || metronomeRunning
        ? 'active'
        : 'idle';

  return (
    <section className={`status-banner status-${tone}`}>
      <p>{statusCopy(permission, tunerListening, metronomeRunning)}</p>
    </section>
  );
}

