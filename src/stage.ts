import { PiplineStage } from './@types/stage';
import { AllFieldMetaUnion, IValidator, FieldMetaList } from './@types/schema';
import { ByteFormFieldState, MetaCache, IByteFormState } from './@types/state';

const UnitPipe: PiplineStage = e => e;

export const pipeInitAllfield: (
    fm: AllFieldMetaUnion,
) => PiplineStage = fm => e => {
    return e;
};
export const pipeInit: (fm: AllFieldMetaUnion) => PiplineStage = (
    fm: AllFieldMetaUnion,
) => e => {
    if (!!e.fieldStore[fm.key]) {
        if (e.fieldStore[fm.key].type !== fm.type)
            e.fieldStore[fm.key].value = undefined;
        if (
            JSON.stringify(e.fieldStore[fm.key].preset) !==
            JSON.stringify(fm.preset)
        ) {
            e.fieldStore[fm.key].value = undefined;
        }
    }
    e.fieldStore[fm.key] = {
        ...e.fieldStore[fm.key],
        key: fm.key,
        initValue: !!fm.initValue ? fm.initValue : undefined,
        preset: !!fm.preset ? fm.preset : undefined,
        type: fm.type,
        // validate: true,
        validators: fm.validators,
        style: fm.style,
        placeholder: fm.placeholder,
        helptext: fm.helptext,
    };

    if (
        !!fm.validators &&
        fm.validators.findIndex(
            e => e.type === 'template' && e.name === 'required',
        ) !== -1
    )
        e.fieldStore[fm.key].required = true;
    return e;
};

export const pipeInitAll: (fms: FieldMetaList) => PiplineStage = fms => e => {
    fms.forEach(v => pipeInit(v)(e));
    return e;
};

const validatorStage: (va: IValidator, key: string) => PiplineStage = (
    va,
    key,
) => e => {
    const curstate = e.fieldStore[key].validate;
    if (curstate === false) return e;
    if (curstate == undefined) e.fieldStore[key].validate = true;
    e.fieldStore[key].helpinfo = undefined;
    const value = e.fieldStore[key].value;
    let validateStatus = true;
    const normalizedValue =
        typeof value === 'string'
            ? value
            : typeof value === 'object' &&
              va.type === 'regex' &&
              va.stringKey &&
              value[va.stringKey]
            ? value[va.stringKey]
            : value !== undefined && value !== null && !!value.toString
            ? value.toString()
            : '';

    switch (va.type) {
        case 'template':
            //need more complex getter function here
            const templateReg = va.name === 'required' ? /^.+$/ : undefined;
            validateStatus = templateReg
                ? templateReg.exec(normalizedValue) !== null
                : true;
            if (!validateStatus)
                e.fieldStore[key].helpinfo = va.message
                    ? va.message
                    : '该项为必填项';
            e.fieldStore[key].validate =
                e.fieldStore[key].validate && validateStatus;
            break;
        case 'regex':
            const regObj =
                typeof va.regex === 'string' ? new RegExp(va.regex) : va.regex;
            validateStatus = regObj.exec(normalizedValue) !== null;
            e.fieldStore[key].validate =
                e.fieldStore[key].validate && validateStatus;
            break;
        case 'compare':
            switch (va.op) {
                case 'eq':
                    validateStatus = value == va.value;
                    break;
                case 'lt':
                    validateStatus = !!value ? value < va.value : true;
                    break;
                case 'lte':
                    validateStatus = !!value ? value <= va.value : true;
                    break;
                case 'gt':
                    validateStatus = !!value ? value > va.value : true;
                    break;
                case 'gte':
                    validateStatus = !!value ? value >= va.value : true;
                    break;
            }
            e.fieldStore[key].validate =
                e.fieldStore[key].validate && validateStatus;
            break;
        default:
            break;
    }

    if (!e.fieldStore[key].validate && !e.fieldStore[key].helpinfo)
        e.fieldStore[key].helpinfo = va.message;

    return e;
};

export const pipeValidators: (
    fs: ByteFormFieldState,
) => PiplineStage = fs => e => {
    e.fieldStore[fs.key].validate = true;
    e.fieldStore[fs.key].helpinfo = undefined;
    const validators = !!fs.validators ? fs.validators : [];
    validators.map(v => validatorStage(v, fs.key)(e));
    return e;
};

export const pipeForceValidate: () => PiplineStage = () => e => {
    Object.entries(e.fieldStore).map(([key, fs]) =>
        fs.validators
            ? fs.validators.map(v => validatorStage(v, key)(e))
            : (() => (e.fieldStore[key].validate = true))(),
    );
    return e;
};

export const pipeSendBack: (cb: (e: any) => void) => PiplineStage = (
    cb: (e: any) => void,
) => e => {
    cb(
        Object.keys(e.fieldStore).reduce(
            (acc, cur) => ({
                ...acc,
                [cur]: {
                    value: e.fieldStore[cur].value,
                    validate: e.fieldStore[cur].validate,
                },
            }),
            {},
        ),
    );
    return e;
};

export const pipeMutation: (
    fs: ByteFormFieldState,
) => PiplineStage = fs => e => {
    const schemas = e.controlSchemaCache;
    for (const schema of schemas)
        if (!!schema) {
            let shouldFieldMutated = false;
            try {
                //TODO:will add lexer to implement a DSL so that we can support more complex detail in later version
                shouldFieldMutated = eval(
                    schema.condition.replace(
                        new RegExp(`{{(.*?)}}`, 'g'),
                        `(e.fieldStore[fs.key].value)`,
                    ),
                );
                const keysMutated = schema.mutation.map(e => e.key);
                if (shouldFieldMutated)
                    for (const k of keysMutated) {
                        !!e.metaSource[k]
                            ? (e.metaSource[k] = {
                                  ...e.metaCache[k],
                                  ...schema.mutation.find(e => e.key === k),
                              })
                            : {};
                    }
            } catch (e) {}
        }

    return e;
};

export const pipeBindValue: (
    fs: ByteFormFieldState,
    value: ByteFormFieldState['value'],
) => PiplineStage = (fs, value) => e => {
    if (!e.bindToExternal) e.fieldStore[fs.key].value = value;
    return e;
};

export const pipeRefreshMetaCache: (
    fms: FieldMetaList,
) => PiplineStage = fms => e => {
    const newMeta = fms
        .map(e => ({ [e.key]: e }))
        .reduce((acc, cur) => Object.assign(acc, { ...cur }), {});
    const newKeys = fms.map(e => e.key);

    e.metaCache = newMeta;
    e.metaSource = newMeta;
    e.fieldStore = Object.keys(e.fieldStore)
        .filter(a => newKeys.includes(a))
        .reduce((acc, cur) => ({ ...acc, [cur]: e.fieldStore[cur] }), {});

    return e;
};

export const pipeBindToExternal: (
    fms: FieldMetaList,
    value?: { [key: string]: any },
) => PiplineStage = (fms, value) => e => {
    if (!value) {
        e.bindToExternal = false;
        return e;
    }
    const intrKeys = fms.map(e => e.key);
    const valueKeys = Object.keys(value);
    if (valueKeys.filter(e => !intrKeys.includes(e)).length > 0) {
        console.warn('meta and bind value not match');
        return e;
    }
    e.bindToExternal = true;
    for (const key of valueKeys) {
        if (!e.fieldStore[key]) continue;
        else e.fieldStore[key].value = value[key];
    }
    return e;
};

export const pipeSetValue: (value?: {
    [key: string]: any;
}) => PiplineStage = value => e => {
    value &&
        Object.entries(value).forEach(([k, v]) => {
            if (e.fieldStore[k] && v) {
                e.fieldStore[k].value = v;
            }
        });
    return e;
};

export const pipeCleanValue: () => PiplineStage = () => e => {
    Object.keys(e.fieldStore).forEach(k => {
        if (e.fieldStore[k]) e.fieldStore[k].value = undefined;
    });
    return e;
};

export const composePipeline = (...pipes: PiplineStage[]) =>
    pipes.reduce((a, c) => e => c(a(e)), UnitPipe);
