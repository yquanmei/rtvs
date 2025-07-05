CvNetVideo = {
    decoder_id: -1
};

//wasm回调
CvNetVideo.JXPCM = function (id, ptr_data, datalen) {
    var samples = Module.HEAPF32.slice(ptr_data / 4, (ptr_data + datalen) / 4);
    postMessage({ id: id, data: samples }, [samples.buffer]);
}
onmessage = function (event) {
    switch (event.data.msg) {
        case "Init":
            init(event.data.libffmpegUrl);
            break;
        case "Decode":
            //编码
            decode(event.data.codec_type, event.data.sampleRate, event.data.array);
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
    CvNetVideo.decoder_id = -1;
}
function decode(codec_type, sampleRate, array) {
    //解码器初始化
    if (CvNetVideo.decoder_id == -1) {
        CvNetVideo.decoder_id = CvNetVideo.WASM.CreateAAudioDecoder(codec_type, sampleRate, 32, 1, 0, 0);
    }
    if (CvNetVideo.decoder_id >= 0) {
        var ptr = new Uint8Array(array);
        //解码
        CvNetVideo.WASM.AudioDecoderDecode(CvNetVideo.decoder_id, ptr, ptr.length);
    }
}

function stop() {
    if (CvNetVideo.decoder_id != -1) {
        CvNetVideo.WASM.AudioDecoderClear(this.decoder_id);
        CvNetVideo.decoder_id = -1;
    }
}