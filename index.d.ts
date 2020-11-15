declare module 'clap-detector' {
  interface Config {
    AUDIO_SOURCE?: string
    MAX_HISTORY_LENGTH?: number
    DETECTION_PERCENTAGE_START?: string
    DETECTION_PERCENTAGE_END?: string
    AUDIO_DETECTION?: {
      MAX_DURATION: number | null
      MIN_DURATION: number | null
      MAX_MAXIMUM_AMPLITUDE: number | null
      MIN_MAXIMUM_AMPLITUDE: number | null
      MAX_MINIMUM_AMPLITUDE: number | null
      MIN_MINIMUM_AMPLITUDE: number | null
      MAX_MID_AMPLITUDE: number | null
      MIN_MID_AMPLITUDE: number | null
      MAX_MEAN_NORM: number | null
      MIN_MEAN_NORM: number | null
      MAX_MEAN_AMPLITUDE: number | null
      MIN_MEAN_AMPLITUDE: number | null
      MIN_RMS_AMPLITUDE: number | null
      MAX_RMS_AMPLITUDE: number | null
      MAX_MAXIMUM_DELTA: number | null
      MIN_MAXIMUM_DELTA: number | null
      MAX_MINIMUM_DELTA: number | null
      MIN_MINIMUM_DELTA: number | null
      MAX_MEAN_DELTA: number | null
      MIN_MEAN_DELTA: number | null
      MAX_RMS_DELTA: number | null
      MIN_RMS_DELTA: number | null
      MAX_FREQUENCY: number | null
      MIN_FREQUENCY: number | null
      MAX_VOLUME_ADJUSTMENT: number | null
      MIN_VOLUME_ADJUSTMENT: number | null
    }
  }
  export function start(config: Config): void
  export function onDetection(cb: (detectionHistory: { id: number; time: number }[]) => void): void
  export function onDetections(numberOfDetections: number, maxDelay: number, cb: (delay: number) => void): void
  export function pause(): void
  export function resume(): void
  export function updateConfig(config: Config): void
}
