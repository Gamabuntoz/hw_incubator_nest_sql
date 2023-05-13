import { Injectable, NotFoundException, PipeTransform } from '@nestjs/common';
import { Types } from 'mongoose';

@Injectable()
export class TryObjectIdPipe implements PipeTransform {
  transform(value: any) {
    let newValue;
    try {
      newValue = new Types.ObjectId(value);
    } catch (e) {
      throw new NotFoundException();
    }
    return newValue;
  }
}
