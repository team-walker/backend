export class SyncTourDataResponseDto {
  // Whether the synchronization was successful
  success: boolean;

  // Number of items synchronized
  count?: number;

  // Error message if failed
  message?: string;
}
