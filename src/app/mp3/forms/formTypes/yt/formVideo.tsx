import { formOptions, checkboxOptions,
    makeCheckboxsRaw, makeCheckboxes, makeDependingCheckboxes } from "../../formElements/checkbox";

import { isBadUrl, FormArgs, apiUrl } from "../../form";

import { 
    VideoAttributes, useVideoAttributes, useVideoOptionValues, 
    useVideoState, useValidOptions } from "../../contexts/VideoContext";

export default function VideoForm({ url, setLoading, setFileName, setTitle }: FormArgs) {

    const { videoOptions, setVideoOptions } = useVideoState();
    const { formatAttr, subtitleAttr, chapterAttr, sponsorAttr } = useVideoAttributes();
    const { formatVals, subtitleVals, chapterVals, sponsorVals} = useVideoOptionValues();
    const isValidOptions = useValidOptions();

    const state = {
        options: videoOptions,
        setOptions: setVideoOptions
    };

    const submit = () => {

        if (isBadUrl(url)) {
            setTitle('Invalid url (*____*! )')
            return;
        }

        if (isValidOptions()) {
            setTitle('Invalid Options (X ____ X )')
            return;
        }

        const getVideoOptions = () => {
            const isAudio = '&isAudio=false';

            const paramStr = 
                (videoAttr: VideoAttributes): string => `${videoAttr};${videoOptions[videoAttr]}`;
            const optionsStr =  
                Object.keys(videoOptions).map(key => paramStr(key as VideoAttributes)).join(';');

            return isAudio + '&options=' + encodeURIComponent(optionsStr);
        }

        setLoading({
            isLoading: true,
            message: 'Downloading Video'
        });

        fetch(apiUrl(getVideoOptions, url))
            .then(res => res.json())
            .then(data => data.fileName)
            .then(fileName => {
                setFileName(fileName);
                setLoading({
                    isLoading: false,
                    message: ''
                });
            });
    };

    const formats = makeCheckboxsRaw(
        formatVals.map(val => '.' + val),
        formatVals,
        formatAttr);
    const formatComponent = makeCheckboxes(
        formats, state);

    const subtitles = makeCheckboxsRaw(['Subtitles'], subtitleVals, subtitleAttr);
    const chapters = makeCheckboxsRaw(['Chapters'], chapterVals, chapterAttr);
    const subsNchapsComponent = makeDependingCheckboxes(
        [...subtitles, ...chapters], state, videoOptions.format != '');

    const sponsor = makeCheckboxsRaw(
        ['Mark', 'Remove'],
        sponsorVals,
        sponsorAttr);
    const sponsorComponent = makeDependingCheckboxes(
        sponsor, state, videoOptions.format != '');

    return (
        <>
            {formOptions(
                'File Formats:', checkboxOptions(formatComponent))}
            <div className="one-line-options">
                {formOptions(
                    'Write to Video:', checkboxOptions(subsNchapsComponent))}
                {formOptions(
                    'Sponsor Handling:', checkboxOptions(sponsorComponent))}
            </div>
            <div
                    className='submition-button' 
                    onClick={submit}>
                    Download
            </div>
            
        </>
    );
}