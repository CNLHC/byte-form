export interface IStdComponentProps {
  onChange: (e: any) => void;
  value: any;
}

export type IStdFieldComponet = (props: IStdComponentProps) => JSX.Element;

export interface IExtraField {
  [type: string]: IStdFieldComponet;
}
