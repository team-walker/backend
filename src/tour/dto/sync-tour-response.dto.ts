export class SyncTourResponseDto {
  // Operation success status
  success: boolean;

  // Response message
  message: string;
}

export class SyncTourDetailResponseDto extends SyncTourResponseDto {
  // Number of updated items
  updatedCount: number;

  // List of updated content IDs
  updatedIds: number[];
}
