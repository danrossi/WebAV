import {
  BoxParser,
  createFile,
  ISOFile,
  BoxKind,
  Box,
  type IsoFileOptions,
  type Movie,
  type Sample,
} from 'mp4box';
import { type MP4ArrayBuffer } from '@webav/mp4box.js';

import { getCodecMap, writeBoxToStream } from '@webav/internal-utils';

import { file } from 'opfs-tools';
import { DEFAULT_AUDIO_CONF } from '../clips';

const trakBox = new BoxParser['box'].trak;
  //esdsBoxType = new BoxParser['box'].esds,
 // dOpsType = new BoxParser['box'].dOps;



export function extractFileConfig(file: ISOFile, info: Movie) {
  const vTrack = info.videoTracks[0];
  const rs: {
    videoTrackConf?: IsoFileOptions;
    videoDecoderConf?: Parameters<VideoDecoder['configure']>[0];
    audioTrackConf?: IsoFileOptions;
    audioDecoderConf?: Parameters<AudioDecoder['configure']>[0];
  } = {};
  if (vTrack != null) {
    const videoCodecMap = getCodecMap(vTrack.codec),
    videoBoxes = getVideoBoxes(file.getTrackById(vTrack.id)),
    videoDesc = parseBoxToDesc(videoBoxes[0]);
    //const videoDesc = parseVideoCodecDesc(file.getTrackById(vTrack.id))?.buffer;
    /*const { descKey, type } = vTrack.codec.startsWith('avc1')
      ? { descKey: 'avcDecoderConfigRecord', type: 'avc1' }
      : vTrack.codec.startsWith('hvc1')
        ? { descKey: 'hevcDecoderConfigRecord', type: 'hvc1' }
        : { descKey: '', type: '' };*/
  
    //if (descKey !== '') {
      rs.videoTrackConf = {
        timescale: vTrack.timescale,
        duration: vTrack.duration,
        width: vTrack.video?.width,
        height: vTrack.video?.height,
        brands: info.brands,
        type: videoCodecMap.type,
        description_boxes: videoBoxes
        //description: videoDesc
        //[descKey]: videoDesc,
      };
   // }

    rs.videoDecoderConf = {
      codec: vTrack.codec,
      codedHeight: vTrack.video?.height,
      codedWidth: vTrack.video?.width,
      description: videoDesc,
    };
  }

  const aTrack = info.audioTracks[0];
  
  if (aTrack != null) {
    const audioCodecMap = getCodecMap(aTrack.codec),
    audioBoxes: Array<BoxKind> = getAudioBoxes(file.getTrackById(aTrack.id));

    
    rs.audioTrackConf = {
      timescale: aTrack.timescale,
      samplerate: aTrack.audio?.sample_rate,
      channel_count: aTrack.audio?.channel_count,
      hdlr: 'soun',
      type: audioCodecMap.type,
      description_boxes: audioBoxes
    };
    rs.audioDecoderConf = {
      //codec: aTrack.codec.startsWith('mp4a')
      //  ? DEFAULT_AUDIO_CONF.codec
      //  : aTrack.codec,
      codec: aTrack.codec,
      numberOfChannels: aTrack.audio?.channel_count ?? DEFAULT_AUDIO_CONF.channelCount,
      sampleRate: aTrack.audio?.sample_rate ?? DEFAULT_AUDIO_CONF.sampleRate
      //...(esdsBox == null ? {} : parseAudioInfo4ESDSBox(esdsBox)),
    };
  }
  return rs;
}

// track is H.264, H.265 or VPX.
function parseBoxToDesc(box: Box): ArrayBuffer {
  /*const stream = new DataStream(undefined, 0, Endianness.BIG_ENDIAN);
  box.write(stream);*/
  const stream = writeBoxToStream(box);
  return new Uint8Array(stream.buffer.slice(8)).buffer; // Remove the box header.

  

  /*
    const avcC = new DataStream();
  avcC.endianness = Endianness.BIG_ENDIAN;
  mp4.getBox('avcC').write(avcC);*/
}

function getVideoBoxes(track: typeof trakBox): Array<BoxKind> {

  const trak = track.mdia.minf.stbl.stsd.entries
  .flat()
  .find(trak => trak.isVideo())

    return trak?.boxes as Array<BoxKind>;
}

function getAudioBoxes(track: typeof trakBox): Array<BoxKind> {

  const trak = track.mdia.minf.stbl.stsd.entries
  .flat()
  .find(trak => trak.isVideo())

  return trak?.boxes as Array<BoxKind>;
}

// 解决封装层音频信息标识错误，导致解码异常
/*function parseAudioInfo4ESDSBox(esds: typeof esdsBoxType) {
  const decoderConf = esds.esd.descs[0]?.descs[0];
  if (decoderConf == null) return {};

  const [byte1, byte2] = decoderConf.data;
  // sampleRate 是第一字节后 3bit + 第二字节前 1bit
  const sampleRateIdx = ((byte1 & 0x07) << 1) + (byte2 >> 7);
  // numberOfChannels 是第二字节 [2, 5] 4bit
  const numberOfChannels = (byte2 & 0x7f) >> 3;
  const sampleRateEnum = [
    96000, 88200, 64000, 48000, 44100, 32000, 24000, 22050, 16000, 12000, 11025,
    8000, 7350,
  ] as const;
  return {
    sampleRate: sampleRateEnum[sampleRateIdx],
    numberOfChannels,
  };
}*/

/**
 * 快速解析 mp4 文件，如果是非 fMP4 格式，会优先解析 moov box（略过 mdat）避免占用过多内存
 */
export async function quickParseMP4File(
  reader: Awaited<ReturnType<ReturnType<typeof file>['createReader']>>,
  onReady: (data: { mp4boxFile: ISOFile; info: Movie }) => void,
  onSamples: (
    id: number,
    sampleType: unknown | 'video' | 'audio',
    samples: Array<Sample>,
  ) => void,
) {
  const mp4boxFile = createFile(false);
  mp4boxFile.onReady = (info: Movie) => {
    onReady({ mp4boxFile, info });
    const vTrackId = info.videoTracks[0]?.id;
    if (vTrackId != null)
      mp4boxFile.setExtractionOptions(vTrackId, 'video', { nbSamples: 100 });

    const aTrackId = info.audioTracks[0]?.id;
    if (aTrackId != null)
      mp4boxFile.setExtractionOptions(aTrackId, 'audio', { nbSamples: 100 });

    mp4boxFile.start();
  };
  mp4boxFile.onSamples = onSamples;

  await parse();

  async function parse() {
    let cursor = 0;
    const maxReadSize = 30 * 1024 * 1024;
    while (true) {
      const data = (await reader.read(maxReadSize, {
        at: cursor,
      })) as MP4ArrayBuffer;
      if (data.byteLength === 0) break;
      data.fileStart = cursor;
      const nextPos = mp4boxFile.appendBuffer(data);
      if (nextPos == null) break;
      cursor = nextPos;
    }

    mp4boxFile.stop();
  }
}
