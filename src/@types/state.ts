import { GenricFieldBase } from "./fields";
import { AllFieldMetaUnion, IValidator } from "./schema";

 interface IByteFormFieldsProps<T> {
    onChange: (v: T) => void
    value: T
}

interface IMutation extends Partial<Omit<AllFieldMetaUnion,"key"> > {key:string}

export interface IControlDescriptor{
    condition:string
    mutation: IMutation[]
}

export type MetaSource={ [key:string]:AllFieldMetaUnion}
export type MetaCache={ [key:string]:AllFieldMetaUnion}

export type  ControlSchemaCache= IControlDescriptor[]
export interface IByteFormState {
    fieldStore: TFieldStore
    metaCache: MetaCache,
    metaSource: MetaSource,
    controlSchemaCache:ControlSchemaCache
    bindToExternal?:boolean
}

export type TFieldStore = { [key: string]: ByteFormFieldState }

export interface ByteFormFieldState {
    key:string
    value?: GenricFieldBase['value']
    type:AllFieldMetaUnion['type']
    validate:boolean

    loading?: boolean
    initValue?: GenricFieldBase['value']
    preset?: GenricFieldBase['preset']
    required?:boolean
    validators?:IValidator[]
    helpinfo?:string
    style?:React.CSSProperties
    placeholder?:string
}


type FieldValidateTime = "valueChange" | "focusLose" | "controlled"
type FieldHelpStatus = "none" | "warning" | "info" | "error" | undefined