export class SystemSettingResponseDto {
  key!: string;
  value!: string;
  description?: string | null;
  createdAt!: Date;
  updatedAt!: Date;
}
