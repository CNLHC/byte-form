import { GenricFieldBase } from "./fields";
import { IControlDescriptor } from "./state";

type FieldTypeName = GenricFieldBase["typename"];

interface IBaseValidator {
  message?: string;
}

interface IValidatorCompare extends IBaseValidator {
  type: "compare";
  op: "lt" | "lte" | "gt" | "gte" | "eq";
  value: GenricFieldBase["value"];
}
interface IValidatorRegex extends IBaseValidator {
  type: "regex";
  regex: RegExp | string;
  stringKey?: string;
}
interface IValidatorTemplate extends IBaseValidator {
  type: "template";
  name: "required";
}

export type IValidator =
  | IValidatorCompare
  | IValidatorRegex
  | IValidatorTemplate;

interface FieldMeta<T extends GenricFieldBase> {
  //Required Field
  key: string;
  type: T["typename"] | string;

  //Optional Field
  label?: string;
  initValue?: T["value"] | string;
  preset?: T["preset"];
  validators?: IValidator[];
  placeholder?: string;
  style?: React.CSSProperties;
  disable?: boolean;
  helptext?: string;
}

export type AllFieldMetaUnion = FieldMeta<GenricFieldBase>;
export type FieldMetaList = Array<AllFieldMetaUnion>;

export type IControlSchema = IControlDescriptor[];
