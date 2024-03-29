import { 
    // Methods to make enclosing divs
    formOptions, checkboxOptions,
    // Methods to make the components
    makeCheckboxsRaw, makeCheckboxes, makeDependingCheckboxes 
} from "../../formElements/checkbox";

import { apiUrl } from '../../form';

import { useUrl } from "../../contexts/FormContext";
import { useTitle } from "../../contexts/FormContext";

import { 
    useAudioState, useValidOptions,
    useAudioAttributes, useAudioOptionValues, 
    AudioAttrubutes
} from '../../contexts/AudioContext';

export default function AudioForm({ setLoading, setFileNames }) {

    const { audioOptions, setAudioOptions } = useAudioState();
    const { formatAttr, embedAttr, downloadAttr } = useAudioAttributes();
    const { formatVals, embedVals, downloadVals } = useAudioOptionValues();
    const isValidOptions = useValidOptions();

    const { url, isSafeUrl } = useUrl()!;
    const { setTitle } = useTitle()!;

    const states = { options: audioOptions, setOptions: setAudioOptions };

    const isValid = (): boolean => {
        if (isSafeUrl(url)) {
            setTitle('Invalid url');
            return false;
        }

        if (!isValidOptions()) {
            setTitle('Invalid options');
            return false;
        }

        return true;
    }

    const submit = () => {

        if (!isValid()) return;

        const getAudioParam = (): string => {
            const isAudio = '&isAudio=true';

            const paramStr = // Getting the attribute and their value
                (attribute: AudioAttrubutes): string => `${attribute}:${audioOptions[attribute]}`;
            const optionsStr = // Looping attribute value pair for options
                Object.keys(audioOptions).map(key => paramStr(key as AudioAttrubutes)).join(';');

            return isAudio + '&options=' + encodeURIComponent(optionsStr);
        }

        setLoading({
            isLoading: true,
            message: 'Downloading Video',
        });

        fetch(apiUrl(getAudioParam, url))
            .then(response => response.json())
            .then(data => data.fileNames)
            .then((fileNames: string) => {
                setFileNames(fileNames);
                setLoading({
                    isLoading: false,
                    message: '',
                });
            });
    };

    const formatObj = makeCheckboxsRaw(
        formatVals.map(val => '.' + val), formatVals, formatAttr);
    const formatComponent = makeCheckboxes(formatObj, states);

    const embedObj = makeCheckboxsRaw(['Embeded'], embedVals, embedAttr);
    const embedComponent = makeDependingCheckboxes(
        embedObj, states, audioOptions.format != '');

    const downloadObj = makeCheckboxsRaw(['Download'], downloadVals, downloadAttr);
    const downloadComponent = makeCheckboxes(downloadObj, states);

    return (
        <>
        {formOptions(
            'File Formats:', checkboxOptions(formatComponent))}

        <div className="form-options">
            <div>Thumbnail:</div>
            <div className="checkbox-options">
                {embedComponent}
                {downloadComponent}
            </div>
        </div>

        <div 
            className='submition-button' 
            onClick={submit}>
            Download
        </div>
        </>
    );
}