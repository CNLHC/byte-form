import React, { useEffect, forwardRef, ReactNode, ReactChild, useState } from 'react'
import { Form, Input, InputNumber, Select, DatePicker } from 'antd';
import { Provider, useDispatch, useSelector } from 'react-redux'
import { GetStore, action, } from './models'
import { composePipeline, pipeInit, pipeValidators, pipeBindValue, pipeSendBack, pipeMutation, pipeRefreshMetaCache, pipeBindToExternal, pipeForceValidate } from './stage';
import { ColProps } from 'antd/lib/col';
import { ByteFormFieldState, IByteFormState, MetaCache } from './@types/state';
import { IMetaFieldSelect } from './@types/fields';
import { AllFieldMetaUnion, FieldMetaList, IControlSchema } from './@types/schema';


export interface IStdComponentProps {
    onChange: (e: any) => void
    value: any
}

type IStdFieldComponet = (props: IStdComponentProps) => JSX.Element

interface IExtraField { [type: string]: IStdFieldComponet }


const SwitchField = (props: {
    fs: ByteFormFieldState
    cb?: (e: any) => void
    ef?: IExtraField
    vff?:boolean
}) => {
    const { cb, fs, ef, vff} = props
    const { type, preset } = fs
    const dispatch = useDispatch()
    useEffect(() => {
        dispatch(action.pipeline(composePipeline(
                pipeBindValue(props.fs, undefined),
                pipeSendBack((e: any) => (!!cb && cb(e))),
            ), "init key"))
    }, [])

    const handleChange = (e: ByteFormFieldState['value']) => {
        dispatch(
            action.pipeline(composePipeline(
                pipeBindValue(props.fs, e),
                pipeValidators(props.fs),
                pipeSendBack((e: any) => (!!cb && cb(e))),
                pipeMutation(props.fs)
            ), `handle change of ${fs.key}`))
    }

    const handleOnBlur = (e: ByteFormFieldState['value']) => {
        dispatch(
            action.pipeline(composePipeline(
                pipeValidators(props.fs),
                pipeMutation(props.fs)
            ), "handle blur of "
            ))
    }

    switch (type) {
        case "datetime":
            return <DatePicker
                onChange={e => e && handleChange(e.unix())}
                placeholder={fs.placeholder}
                showTime
            />
        case "input":
            return <Input
                onChange={e => handleChange(e.target.value)}
                value={fs.value}
                placeholder={fs.placeholder}
            // onBlur={e => console.log("input blur", e)}
            />
        case "number":
            return <InputNumber
                onChange={e => handleChange(e as number)}
                value={fs.value as number}
                // onBlur={e => console.log("number blur", e)}
                style={props.fs.style}
                placeholder={fs.placeholder}
            />
        case "select":
            return <Select
                onChange={(e: any) => handleChange(e as string)}
                // onBlur={e => console.log("select blur", e)}
                value={fs.value}
                placeholder={fs.placeholder}
                {...props}
            >
                {!!(preset as IMetaFieldSelect['preset']) ? (preset as Required<IMetaFieldSelect>['preset']).map(e =>
                    <Select.Option key={e.key} value={e.key}>
                        {e.verbose}
                    </Select.Option>
                ) : null}
            </Select>
        default:
            if (ef && ef[type]) {
                const Component = ef[type]
                return <Component
                    onChange={(e: any) => handleChange(e )}
                    value={fs.value}
                />
            }
            return null
    }
}



const WrappedField = forwardRef((props: {
    fm: AllFieldMetaUnion
    cb?: (e: any) => void
    ef?: IExtraField
    vff?:boolean
}, ref: any) => {
    const { fm, cb, ef ,vff} = props
    const dispatch = useDispatch()
    const fState = useSelector<IByteFormState, ByteFormFieldState | undefined>(e => e.fieldStore[fm.key])
    useEffect(() => {
        dispatch(
            action.pipeline(composePipeline(pipeInit(fm),
                pipeSendBack((e: any) => (!!cb && cb(e)))), `field meta change: ${fm.key}`))
    }, [fm])

    if (fm.disable)
        return null

    if (!!fState) {
        const { required, validate, helpinfo } = fState
        return <Form.Item
            label={fm.label}
            key={fm.key}
            validateStatus={validate===undefined ? 'success' :validate?'success': 'error'}
            help={helpinfo}
            required={required}
        >
            <SwitchField fs={fState} cb={cb} ef={ef} vff={vff}/>
        </Form.Item>
    }
    else
        return null
})


interface IProps {
    formMeta: FieldMetaList
    value?: { [key: string]: any }
    controlSchema?: IControlSchema

    labelAlign?: "left" | "right"
    wrapperCol?: ColProps;
    labelCol?: ColProps;
    callback?: (e: any) => void
}

interface innerProps {
    forceValidate?: boolean
    ef?: IExtraField
    vff?:boolean
    store:any

}


const Connector = (props: IProps & innerProps) => {
    const { controlSchema, value, forceValidate ,vff,store} = props
    //I hope one day typescript can support rust-style local immutable variable shadow!
    const tControlSchema = !!controlSchema ? controlSchema : []

    useEffect(() => {
        store.dispatch(action.setState({
            metaSource: props.formMeta.map(e => ({ [e.key]: e })).reduce((acc, cur) => Object.assign(acc, { ...cur }), {})
        }));
        return
    }, [])


    useEffect(() => {
        store.dispatch(action.pipeline(pipeRefreshMetaCache(props.formMeta), "refresh meta cache"));
        return
    }, [props.formMeta])

    useEffect(() => {
        store.dispatch(action.setState({
            controlSchemaCache: tControlSchema
        }));
        return
    }, [tControlSchema])

    useEffect(() => {
        store.dispatch(action.pipeline(pipeBindToExternal(props.formMeta, value), "bind To external"))
    }, [value])

    return (
        <Provider store={store}>
            <GenedForm {...props} />
        </Provider>
    )
}

const GenedForm = (props: IProps & innerProps) => {
    const metaSource = useSelector<IByteFormState, MetaCache>(e => !!e ? e.metaSource : {})
    const { callback, ef ,vff} = props
    const items = Object.keys(metaSource).map(e => <WrappedField fm={metaSource[e]} cb={callback} key={e} ef={ef} vff={vff}/>)

    return (
        <Form
            wrapperCol={props.wrapperCol}
            labelCol={props.labelCol}
            labelAlign={props.labelAlign}
        >
            {items}
        </Form>
    )
}



export const SwitchForm = (props: { children: JSX.Element[] }) => {
    const [store, _] = useState(GetStore())

    return (<div>
        <Provider store={store}>
            {props.children}
        </Provider>
    </div>)
}


interface IGetFormOpt {
    extraField?: IExtraField,
}


export interface FormAction{
    getValue:()=>{[key:string]:any},
    getValidate:()=>{[key:string]:boolean}
    forceValidate:()=>void
    check:()=>boolean
}

function getForm(opt: IGetFormOpt):[FormAction,(props:IProps)=>JSX.Element] {
    let forceValidateUpdate = false
    let extraField = { ...opt.extraField }
    let vff = false
    const store =GetStore()
    
    
    const getValue = () => Object.entries(store.getState().fieldStore).reduce((acc, cur) => ({ ...acc, [cur[0]]: cur[1].value }), {})
    const getValidate = () => Object.entries(store.getState().fieldStore).reduce((acc, cur) => ({ ...acc, [cur[0]]: cur[1].validate }), {})
    const forceValidate = () => store.dispatch(action.pipeline(pipeForceValidate(),"force Update"))
    const check = ()=> Object.entries(store.getState().fieldStore).reduce((acc,cur)=>acc&&cur[1].validate,true)


    return [
        { 
            getValue,
            forceValidate,
            getValidate,
            check
        },
        (props: IProps) => <Connector {...props}
            forceValidate={forceValidateUpdate}
            callback={(e) =>  props.callback&&props.callback(e) }
            ef={extraField}
            vff={vff}
            store={store}
            />
    ]
}

const GenForm = Connector

export { GenForm, getForm }