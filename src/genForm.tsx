import React, { useEffect, forwardRef, useReducer, useContext } from "react";
import { reducer, initState, TByteFormReducer } from "./models";
import {
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Tooltip,
  Icon
} from "antd";
import { action, ByteFormCtx } from "./models";
import {
  composePipeline,
  pipeInit,
  pipeValidators,
  pipeBindValue,
  pipeSendBack,
  pipeMutation,
  pipeRefreshMetaCache,
  pipeBindToExternal
} from "./stage";
import { ColProps } from "antd/lib/col";
import { ByteFormFieldState } from "./@types/state";
import { IMetaFieldSelect } from "./@types/fields";
import {
  AllFieldMetaUnion,
  FieldMetaList,
  IControlSchema
} from "./@types/schema";
import { IExtraField } from "./@types/extraField";

const SwitchField = (props: {
  fs: ByteFormFieldState;
  cb?: (e: any) => void;
  ef?: IExtraField;
  vff?: boolean;
}) => {
  const { cb, fs, ef } = props;
  const { type, preset } = fs;
  const { dispatch } = useContext(ByteFormCtx);

  useEffect(() => {
    dispatch(
      action.pipeline(
        composePipeline(
          pipeBindValue(props.fs, undefined),
          pipeSendBack((e: any) => !!cb && cb(e))
        ),
        "init key"
      )
    );
  }, []);

  const handleChange = (e: ByteFormFieldState["value"]) => {
    dispatch(
      action.pipeline(
        composePipeline(
          pipeBindValue(props.fs, e),
          pipeValidators(props.fs),
          pipeSendBack((e: any) => !!cb && cb(e)),
          pipeMutation(props.fs)
        ),
        `handle change of ${fs.key}`
      )
    );
  };

  switch (type) {
    case "datetime":
      return (
        <DatePicker
          onChange={e => e && handleChange(e.unix())}
          placeholder={fs.placeholder}
          style={props.fs.style}
          showTime
        />
      );
    case "input":
      return (
        <Input
          onChange={e => handleChange(e.target.value)}
          value={fs.value}
          style={props.fs.style}
          placeholder={fs.placeholder}
        />
      );
    case "number":
      return (
        <InputNumber
          onChange={e => handleChange(e as number)}
          value={fs.value as number}
          style={props.fs.style}
          placeholder={fs.placeholder}
        />
      );
    case "select":
      return (
        <Select
          onChange={(e: any) => handleChange(e as string)}
          value={fs.value}
          style={props.fs.style}
          placeholder={fs.placeholder}
          {...props}
        >
          {!!(preset as IMetaFieldSelect["preset"])
            ? (preset as Required<IMetaFieldSelect>["preset"]).map(e => (
                <Select.Option key={e.key} value={e.key}>
                  {e.verbose}
                </Select.Option>
              ))
            : null}
        </Select>
      );
    default:
      if (ef && ef[type]) {
        const Component = ef[type];
        return (
          <Component onChange={(e: any) => handleChange(e)} value={fs.value} />
        );
      }
      return null;
  }
};

const WrappedField = forwardRef(
  (props: {
    fm: AllFieldMetaUnion;
    cb?: (e: any) => void;
    ef?: IExtraField;
    vff?: boolean;
  }) => {
    const { fm, cb, ef, vff } = props;
    const { dispatch, state } = useContext(ByteFormCtx);
    const fState = state.fieldStore[fm.key];
    useEffect(() => {
      dispatch(
        action.pipeline(
          composePipeline(
            pipeInit(fm),
            pipeSendBack((e: any) => !!cb && cb(e))
          ),
          `field meta change: ${fm.key}`
        )
      );
    }, [fm]);

    if (fm.disable) return null;

    if (!!fState) {
      const { required, validate, helpinfo, helptext } = fState;
      const label = helptext ? (
        <Tooltip title={helptext}>
          <span>{fm.label}</span>
          <Icon type="question-circle-o" />
        </Tooltip>
      ) : (
        <span>{fm.label}</span>
      );

      return (
        <Form.Item
          label={label}
          key={fm.key}
          help={helpinfo}
          validateStatus={
            validate === undefined ? "success" : validate ? "success" : "error"
          }
          required={required}
        >
          <SwitchField fs={fState} cb={cb} ef={ef} vff={vff} />
        </Form.Item>
      );
    } else return null;
  }
);

export interface IConnectorProps {
  formMeta: FieldMetaList;
  value?: { [key: string]: any };
  controlSchema?: IControlSchema;

  labelAlign?: "left" | "right";
  wrapperCol?: ColProps;
  labelCol?: ColProps;
  callback?: (e: any) => void;
}

interface innerProps {
  ef?: IExtraField;
}

const GenedForm = (props: IConnectorProps & innerProps) => {
  const { state } = useContext(ByteFormCtx);
  const metaSource = state.metaSource;
  const { callback, ef } = props;
  const items = Object.keys(metaSource).map(e => {
    return <WrappedField fm={metaSource[e]} cb={callback} key={e} ef={ef} />;
  });

  return (
    <Form
      wrapperCol={props.wrapperCol}
      labelCol={props.labelCol}
      labelAlign={props.labelAlign}
    >
      {items}
    </Form>
  );
};

export const Connector = (props: IConnectorProps & innerProps) => {
  const { controlSchema, value } = props;
  const [state, dispatch] = useReducer<TByteFormReducer>(reducer, initState);

  //I hope one day typescript can support rust-style local immutable variable shadow!
  const tControlSchema = !!controlSchema ? controlSchema : [];

  useEffect(() => {
    dispatch(
      action.setState({
        metaSource: props.formMeta
          .map(e => ({ [e.key]: e }))
          .reduce((acc, cur) => Object.assign(acc, { ...cur }), {})
      })
    );
    return;
  }, []);

  useEffect(() => {
    dispatch(
      action.pipeline(
        pipeRefreshMetaCache(props.formMeta),
        "refresh meta cache"
      )
    );
    return;
  }, [props.formMeta]);

  useEffect(() => {
    dispatch(
      action.setState({
        controlSchemaCache: tControlSchema
      })
    );
    return;
  }, [tControlSchema]);

  useEffect(() => {
    dispatch(
      action.pipeline(
        pipeBindToExternal(props.formMeta, value),
        "bind To external"
      )
    );
  }, [value]);

  return (
    <ByteFormCtx.Provider value={{ state, dispatch }}>
      <GenedForm {...props} />
    </ByteFormCtx.Provider>
  );
};

const GenForm = Connector;

export { GenForm };
