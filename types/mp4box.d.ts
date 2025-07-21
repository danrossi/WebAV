declare module 'mp4box.js' {


  export interface SampleOpts {
    duration: number;
    dts?: number;
    cts: number;
    sample_description_index?: number;
    is_sync: boolean;
    //description?: MP4ABoxParser | AVC1BoxParser | HVCBoxParser;
    is_leading?: number;
    depends_on?: number;
    is_depended_on?: number;
    has_redundancy?: number;
    degradation_priority?: number;
    subsamples?: Array<SubSample>;
    offset?: number;
  }

  export type MP4ArrayBuffer = ArrayBuffer & { fileStart: number };

}
