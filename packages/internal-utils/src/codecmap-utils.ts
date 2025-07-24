import { type SampleEntryFourCC } from 'mp4box';

//codec info map entry
interface CodecInfoEntry {
  type: SampleEntryFourCC;
  codecString: string;
  //enum of box types
  boxName: 'esds' | 'dOps' | 'vpcC' | 'hvcC' | 'avcC' | 'av1C';
}

/**
 * Extract type from codec string
 * @param codec 
 * @returns 
 */
export function codecToType(codec: string): SampleEntryFourCC {
  return codec.substring(0, 4) as SampleEntryFourCC;
}

/**
 * Get codec map from codec string
 * @param codec 
 * @returns 
 */
export function getCodecMap(codec: string): CodecInfoEntry {
  return codecInfoMap.get(codecToType(codec))!;
}

//codec info map to type, codec string and codec code
export const codecInfoMap: Map<string, CodecInfoEntry> = new Map([
  [
    'mp4a',
    {
      type: 'mp4a',
      codecString: 'mp4a.40.2',
      boxName: 'esds'
    } as CodecInfoEntry
  ],
  [
    'aac',
    {
      type: 'mp4a',
      codecString: 'mp4a.40.2',
      boxName: 'esds'
    } as CodecInfoEntry
  ],
  [
    'opus',
    { 
      type: 'Opus', 
      codecString: 'opus',
      boxName: 'dOps'
    } as CodecInfoEntry
  ],
  [
    'avc1',
    {
      type: 'avc1',
      boxName: 'avcC'
    } as CodecInfoEntry
  ],
  [
    'hevc1',
    {
      type: 'hevc1',
      boxName: 'hvcC'
    } as CodecInfoEntry
  ],
  [
    'vp09',
    {
      type: 'vp09',
      boxName: 'vpcC'
    } as CodecInfoEntry
  ],
  [
    'av01',
    {
      type: 'av01',
      boxName: 'av1C'
    } as CodecInfoEntry
  ]
]);
