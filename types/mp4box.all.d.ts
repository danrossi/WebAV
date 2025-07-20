import {
  B as Box,
  b as BOXES,
  a as BoxRegistry,
  S as Sample,
  T as TypedArray,
} from './log-wTYnzAry.js';
export {
  J as AllIdentifiers,
  A as AudioSampleEntry,
  z as BoxFourCC,
  P as BoxKind,
  aa as Charset,
  m as createFile,
  D as DataStream,
  $ as Description,
  n as Descriptor,
  u as DescriptorRegistry,
  ah as EncodedLengthStringType,
  af as EncodedStringType,
  E as Endianness,
  ac as EndianNumberType,
  ai as EndianStringType,
  a2 as EntityGroup,
  a8 as Entry,
  o as ES_Descriptor,
  x as Extends,
  X as ExtractedTrack,
  am as FnType,
  W as FragmentedTrack,
  F as FullBox,
  ak as GetterSetterType,
  H as HintSampleEntry,
  a0 as IncompleteBox,
  w as InstanceOf,
  r as ISOFile,
  I as IsoFileOptions,
  a1 as Item,
  K as KindOf,
  ag as LengthStringType,
  L as Log,
  a4 as Matrix,
  M as MetadataSampleEntry,
  _ as Movie,
  s as MP4BoxBuffer,
  t as MP4BoxStream,
  p as MPEG4DescriptorParser,
  l as MultiBufferStream,
  a5 as Nalu,
  a6 as NaluArray,
  N as NumberTuple,
  ad as NumberType,
  a7 as Output,
  ao as ParsedType,
  a9 as Reference,
  h as SampleEntry,
  C as SampleEntryFourCC,
  Q as SampleEntryKind,
  Y as SampleGroup,
  c as SampleGroupEntry,
  G as SampleGroupEntryGroupingType,
  R as SampleGroupEntryKind,
  q as SampleGroupInfo,
  ab as SimpleNumberType,
  ae as SimpleStringType,
  e as SingleItemTypeReferenceBox,
  f as SingleItemTypeReferenceBoxLarge,
  aj as StringType,
  ar as StructDataFromStructDefinition,
  ap as StructDefinition,
  a3 as SubSample,
  i as SubtitleSampleEntry,
  k as SystemSampleEntry,
  j as TextSampleEntry,
  Z as Track,
  d as TrackGroupTypeBox,
  g as TrackReferenceTypeBox,
  y as TupleOf,
  al as TupleType,
  an as Type,
  U as UUIDKeys,
  O as UUIDKind,
  aq as ValueFromType,
  v as ValueOf,
  V as VisualSampleEntry,
} from './log-wTYnzAry.js';

declare const DIFF_BOXES_PROP_NAMES: readonly [
  'boxes',
  'entries',
  'references',
  'subsamples',
  'items',
  'item_infos',
  'extents',
  'associations',
  'subsegments',
  'ranges',
  'seekLists',
  'seekPoints',
  'esd',
  'levels',
];
declare const DIFF_PRIMITIVE_ARRAY_PROP_NAMES: readonly [
  'compatible_brands',
  'matrix',
  'opcolor',
  'sample_counts',
  'sample_deltas',
  'first_chunk',
  'samples_per_chunk',
  'sample_sizes',
  'chunk_offsets',
  'sample_offsets',
  'sample_description_index',
  'sample_duration',
];
/** @bundle box-diff.js */
declare function boxEqualFields(box_a: Box, box_b: Box): boolean;
declare function boxEqual(box_a: Box, box_b: Box): boolean;

declare class VTTin4Parser {
  parseSample(data: TypedArray): Box[];
  getText(startTime: number, endTime: number, data: TypedArray): string;
}
declare class XMLSubtitlein4Parser {
  parseSample(sample: Sample): {
    resources: Array<Uint8Array>;
    documentString: string;
    document: undefined | Document;
  };
}
declare class Textin4Parser {
  parseSample(sample: Sample): string;
  parseConfig(data: TypedArray): string;
}
declare class TX3GParser {
  parseSample(sample: Sample): string;
}

declare const BoxParser: BoxRegistry<typeof BOXES>;

export {
  Box,
  boxEqual,
  boxEqualFields,
  BoxParser,
  BoxRegistry,
  DIFF_BOXES_PROP_NAMES,
  DIFF_PRIMITIVE_ARRAY_PROP_NAMES,
  Sample,
  Textin4Parser,
  TX3GParser,
  TypedArray,
  VTTin4Parser,
  XMLSubtitlein4Parser,
};
