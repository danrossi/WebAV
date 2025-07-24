import { DataStream, Endianness, BoxParser, Box, MP4BoxBuffer,  MultiBufferStream } from 'mp4box';


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
 * Create the description box from a decoder description
 * @param desc 
 * @param boxName 
 * @returns 
 */
export function createBoxFromDescription(desc:ArrayBuffer, boxName: 'esds' | 'dOps' | 'vpcC' | 'hvcC' | 'avcC' | 'av1C'): Box {
  const buffer = new MultiBufferStream(MP4BoxBuffer.fromArrayBuffer(desc, 0)),
  box = new BoxParser.box[boxName](buffer.byteLength);
  box.parse(buffer);
  return box;
}