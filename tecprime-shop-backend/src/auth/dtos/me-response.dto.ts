import { ListAddressDto } from 'src/addresses/dtos/list-address.dto';

export class MeResponseDto {
  id: number;
  email: string;
  name: string;
  addresses: ListAddressDto[];
}
