import {
  Box,
  BoxParser,
  DataStream,
  Endianness,
  MP4BoxBuffer,
  MultiBufferStream,
} from 'mp4box';
//import { Log } from './log';

function createESDSBoxHeader(
  config: ArrayBuffer | ArrayBufferView,
  //bitrate: number
) {
  const configlen = config.byteLength;
  const buf = new Uint8Array([
    0x00, // version 0
    0x00,
    0x00,
    0x00, // flags

    0x03, // descriptor_type
    0x17 + configlen, // length
    0x00,
    // 0x01, // es_id
    0x02, // es_id
    0x00, // stream_priority

    0x04, // descriptor_type
    0x12 + configlen, // length
    0x40, // codec : mpeg4_audio
    0x15, // stream_type
    0x00,
    0x00,
    0x00, // buffer_size
    0x00,
    0x00,
    0x00,
    0x00, // maxBitrate
    0x00,
    0x00,
    0x00,
    0x00, // avgBitrate

    0x05, // descriptor_type

    configlen,
    ...new Uint8Array(config instanceof ArrayBuffer ? config : config.buffer),

    0x06,
    0x01,
    0x02,
  ]);

  return buf;
}

/**
 * Util to write box to a data stream for extracting the box data
 * @param box
 * @returns
 */
export function writeBoxToStream(box: Box): DataStream {
  const ds = new DataStream();
  ds.endianness = Endianness.BIG_ENDIAN;
  box.write(ds);
  return ds;
}

/**
 * Parse codec box to decoder config
 * @param box
 * @returns
 */
export function boxToDecoderConfig(box: Box): ArrayBuffer {
  const stream = writeBoxToStream(box);
  return new Uint8Array(stream.buffer.slice(8)).buffer;
}

/**
 * Create the description box from a decoder description
 * @param desc
 * @param boxName
 * @returns
 */
export function createBoxFromDescription(
  desc: ArrayBuffer,
  boxName: 'esds' | 'dOps' | 'vpcC' | 'hvcC' | 'avcC' | 'av1C',
): Box {
  //export function createBoxFromDescription(desc:MP4BoxStream | MultiBufferStream, boxName: 'esds' | 'dOps' | 'vpcC' | 'hvcC' | 'avcC' | 'av1C'): Box | undefined {
  // if (desc) {
  const buffer = new MultiBufferStream(MP4BoxBuffer.fromArrayBuffer(desc, 0));
  //Log.info("BUFFER", desc, buffer);
  const box = new BoxParser.box[boxName](buffer.byteLength);
  box.hdr_size = 0;
  box.parse(buffer);
  return box;
  // } else {
  // return undefined;
  //}
}

/**
 * Create AAC/Opus audio boxes from the decoder description
 * @param desc
 * @param boxName
 * @param bitrate
 * @returns
 */
export function createAudioBoxesFromDescription(
  desc: ArrayBuffer,
  boxName: 'esds' | 'dOps' | 'vpcC' | 'hvcC' | 'avcC' | 'av1C',
  bitrate: number,
): Array<Box> {
  const boxes: Array<Box> = [];

  switch (boxName) {
    case 'dOps':
      const dopsBox = createBoxFromDescription(desc.slice(8), boxName);
      const bitrateBox = new BoxParser.box['btrt']();

      bitrateBox.bufferSizeDB = 0;
      bitrateBox.maxBitrate = bitrateBox.avgBitrate = bitrate;

      //console.log(dopsBox);
      //console.log(bitrateBox);

      boxes.push(dopsBox);
      boxes.push(bitrateBox);
      break;
    default:
      //const esdsBox = createBoxFromDescription(createESDSBoxHeader(desc, bitrate).buffer, boxName);
      const esdsBox = createBoxFromDescription(
        createESDSBoxHeader(desc).buffer,
        boxName,
      );
      //console.log(esdsBox);

      boxes.push(esdsBox);

      break;
  }

  return boxes;
}
