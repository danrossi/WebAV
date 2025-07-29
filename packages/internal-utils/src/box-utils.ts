import { DataStream, Endianness, BoxParser, Box, MP4BoxBuffer,  MultiBufferStream } from 'mp4box';
import { Log } from './log';

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
export function createBoxFromDescription(desc:ArrayBuffer, boxName: 'esds' | 'dOps' | 'vpcC' | 'hvcC' | 'avcC' | 'av1C'): Box | undefined {
  if (desc) {
    const buffer = new MultiBufferStream(MP4BoxBuffer.fromArrayBuffer(desc, 0));
    Log.info("BUFFER", desc, buffer);

    const box = new BoxParser.box[boxName](buffer.byteLength);
    box.parse(buffer);
    return box;
  } else {
    return undefined;
  }
  
}