import { SetMetadata } from '@nestjs/common';
import { IS_PUBLIC_KEY } from '../../consts/index.js';

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
