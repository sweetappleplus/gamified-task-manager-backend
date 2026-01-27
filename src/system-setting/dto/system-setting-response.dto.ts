import type { SystemSetting } from '../../modules/types/index.js';

export class SystemSettingResponseDto implements SystemSetting {
  key!: string;
  value!: string;
  description!: string | null;
  createdAt!: Date;
  updatedAt!: Date;
}
