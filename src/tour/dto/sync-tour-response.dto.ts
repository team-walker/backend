export class SyncTourResponseDto {
  success: boolean;

  message: string;
}

export class SyncTourDetailResponseDto extends SyncTourResponseDto {
  updatedCount: number;

  updatedIds: number[];
}
