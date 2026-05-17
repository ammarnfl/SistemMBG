import { PartialType } from '@nestjs/mapped-types';
import { CreateKomponenMasterDto } from './create-komponen-master.dto';

export class UpdateKomponenMasterDto extends PartialType(CreateKomponenMasterDto) {}
