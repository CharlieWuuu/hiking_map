import { ValidationOptions, registerDecorator } from 'class-validator';

// 按 UTF-8 位元組長度限制，而非字元數。
//
// 用於密碼：bcrypt 只處理前 72 個 **bytes**，超過的部分會被無聲截斷。
// 用 MaxLength(72) 擋不住這件事——72 個中文字是 216 bytes，會通過驗證後被截成約 24 字，
// 使用者以為設了長密碼，實際生效的只有前面一小段。
export function MaxBytes(max: number, options?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'maxBytes',
      target: object.constructor,
      propertyName,
      constraints: [max],
      options,
      validator: {
        validate(value: unknown) {
          if (typeof value !== 'string') return true; // 型別交給 @IsString 管
          return Buffer.byteLength(value, 'utf8') <= max;
        },
        defaultMessage() {
          return `長度不可超過 ${max} 個位元組（中文字每字約 3 個位元組）`;
        },
      },
    });
  };
}
