
import {jsonMember, jsonObject} from "typedjson";
import { Deserializers } from "../../../../util/deserializers";

@jsonObject
export class PaginationQueryParamsDto {
    @jsonMember({name: 'page_size', deserializer: Deserializers.numeric(10)}) public pageSize!: number;
    @jsonMember({deserializer: Deserializers.numeric(0)}) public page!: number;
}
