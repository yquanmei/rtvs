CvNetVideo = {
    encoder_id: -1
};

//wasm回调
CvNetVideo.JXEncodeAudio = function (id, ptr_data, datalen) {
    var data = Module.HEAPU8.subarray(ptr_data, ptr_data + datalen);
    var newBf = data.slice(0, datalen).buffer; // 从0 - 9 不包括 10

    postMessage({ id: id, data: newBf }, [newBf]);
    //this.audio_player.InputEncodeAudio(id , data, data.length);
}
onmessage = function (event) {
    switch (event.data.msg) {
        case "Init":
            init(event.data.libffmpegUrl);
            break;
        case "Encode":
            //编码
            encode(event.data.codec_type, event.data.sampleRate, event.data.has_haisi, event.data.frame_length, event.data.array);
            break;
        case "Stop":
            stop();
            break;
        default:
    }
};


function init(libffmpegUrl) {
    Module = typeof Module !== "undefined" ? Module : {};
    Module["locateFile"] = function () {

        let wasmurl = libffmpegUrl.substr(0, libffmpegUrl.lastIndexOf("/") + 1) + "libffmpeg.wasm";
        return wasmurl;
    }

    importScripts(libffmpegUrl);

    CvNetVideo.WASM = {
        FfmpegInit: Module["cwrap"]('FfmpegInit', 'number'),
        CreateAVideoDecoder: Module["cwrap"]('CreateAVideoDecoder', 'number', ['number', 'number']),
        VideoDecoderDecode: Module["cwrap"]('VideoDecoderDecode', 'number', ['number', 'array', 'number']),
        VideoDecoderFlush: Module["cwrap"]('VideoDecoderFlush', 'number', ['number']),
        VideoDecoderClear: Module["cwrap"]('VideoDecoderClear', 'number', ['number']),
        CreateAAudioEncoder: Module["cwrap"]('CreateAAudioEncoder', 'number', ['number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number']),
        AudioEncoderEncode: Module["cwrap"]('AudioEncoderEncode', 'number', ['number', 'array', 'number']),
        AudioEncoderClear: Module["cwrap"]('AudioEncoderClear', 'number', ['number']),
        CreateAAudioDecoder: Module["cwrap"]('CreateAAudioDecoder', 'number', ['number', 'number', 'number', 'number', 'number', 'number']),
        AudioDecoderDecode: Module["cwrap"]('AudioDecoderDecode', 'number', ['number', 'array', 'number']),
        AudioDecoderFlush: Module["cwrap"]('AudioDecoderFlush', 'number', ['number']),
        AudioDecoderClear: Module["cwrap"]('AudioDecoderClear', 'number', ['number']),
        CreateAAacTranscoder: Module["cwrap"]('CreateAAacTranscoder', 'number', ['number', 'number', 'number', 'number']),
        AacTranscoderTrans: Module["cwrap"]('AacTranscoderTrans', 'number', ['number', 'array', 'number']),
        AacTranscoderFlush: Module["cwrap"]('AacTranscoderFlush', 'number', ['number']),
        AacTranscoderClear: Module["cwrap"]('AacTranscoderClear', 'number', ['number']),
        CreateFMp4Muxer: Module["cwrap"]('CreateFMp4Muxer', 'number', ['number', 'number', 'number', 'number']),
        FMp4Input1078Package: Module["cwrap"]('FMp4Input1078Package', 'number', ['number', 'array', 'number']),
        FMp4MuxClear: Module["cwrap"]('FMp4MuxClear', 'number', ['number']),

        JX_ADPCMA: 26,
        JX_H264: 98,

        AV_PIX_FMT_RGB24: 2,
        AV_PIX_FMT_ARGB: 27,
        AV_PIX_FMT_RGBA: 28
    };
    addOnPostRun(function () {
        try {
            CvNetVideo.WASM.FfmpegInit();
        } catch (e) {
            console.error(e);
        }
    });
    CvNetVideo.encoder_id = -1;
}
function encode(codec_type, sampleRate, has_haisi, frame_length, array) {

    //编码音频数据
    if (CvNetVideo.encoder_id == -1) {
        console.log("codectype:%d, samplerate:%d, haisi:%d, frame_length:%d", codec_type, sampleRate, has_haisi, frame_length);
        CvNetVideo.encoder_id = CvNetVideo.WASM.CreateAAudioEncoder(codec_type, sampleRate, 1, 32, 8000, 1, 16, has_haisi, frame_length);
    }

    if (CvNetVideo.encoder_id >= 0) {
        //编码
        let ptr_data = new Uint8Array(array);
        CvNetVideo.WASM.AudioEncoderEncode(CvNetVideo.encoder_id, ptr_data, ptr_data.length);
    }
}


function stop() {
    if (CvNetVideo.encoder_id != -1) {
        CvNetVideo.WASM.AudioEncoderClear(CvNetVideo.encoder_id);
        CvNetVideo.encoder_id = -1;
    }
}