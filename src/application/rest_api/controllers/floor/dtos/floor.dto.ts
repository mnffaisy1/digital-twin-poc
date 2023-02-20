import { Expose, Type } from 'class-transformer';
import { RoomDto } from '../../room/dtos/room.dto';
export class FloorDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  @Type(() => RoomDto)
  rooms?: RoomDto[];
}
