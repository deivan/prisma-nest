import { IsEnum, IsNotEmpty } from 'class-validator';

export enum Zone {
  HEAD = 'head',
  BODY = 'body',
  LEGS = 'legs',
}

export class MakeMoveDto {
  @IsEnum(Zone, { message: 'Зона атаки повинна бути head, body або legs' })
  @IsNotEmpty()
  attackZone!: Zone;

  @IsEnum(Zone, { message: 'Зона захисту повинна бути head, body або legs' })
  @IsNotEmpty()
  defenseZone!: Zone;
}
