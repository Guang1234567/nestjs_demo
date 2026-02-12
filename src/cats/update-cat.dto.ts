import { PartialType } from '@nestjs/mapped-types';
import { CreateCatDto } from './create-cat.dto';

/**
 * UpdateCatDto 用于更新猫咪信息。
 * 虽然 PUT 通常用于全量更新，但使用 PartialType 可以让我们：
 * 1. 继承 CreateCatDto 的所有验证规则。
 * 2. 在需要支持 PATCH（部分更新）时无需重复定义。
 * 3. 保持代码结构的清晰和一致性。
 */
export class UpdateCatDto extends PartialType(CreateCatDto) {}
