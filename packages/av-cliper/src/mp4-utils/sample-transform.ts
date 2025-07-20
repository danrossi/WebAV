import {
  createFile,
  MP4ArrayBuffer,
  MP4File,
  type Movie,
  type Sample,
} from 'mp4box';

/**
 * 将原始字节流转换成 Sample 流
 */
export class SampleTransform {
  readable: ReadableStream<
    | {
        chunkType: 'ready';
        data: { info: Movie; file: MP4File };
      }
    | {
        chunkType: 'samples';
        data: { id: number; type: 'video' | 'audio'; samples: Sample[] };
      }
  >;

  writable: WritableStream<Uint8Array>;

  #inputBufOffset = 0;

  constructor() {
    const file = createFile();
    let streamCancelled = false;
    this.readable = new ReadableStream(
      {
        start: (ctrl) => {
          file.onReady = (info: Movie) => {
            const vTrackId = info.videoTracks[0]?.id;
            if (vTrackId != null)
              file.setExtractionOptions(vTrackId, 'video', { nbSamples: 100 });

            const aTrackId = info.audioTracks[0]?.id;
            if (aTrackId != null)
              file.setExtractionOptions(aTrackId, 'audio', { nbSamples: 100 });

            ctrl.enqueue({ chunkType: 'ready', data: { info, file } });
            file.start();
          };

          const releasedCnt: Record<number, number> = {};
          file.onSamples = (id, type, samples) => {
            ctrl.enqueue({
              chunkType: 'samples',
              data: { id, type, samples: samples.map((s) => ({ ...s })) },
            });
            releasedCnt[id] = (releasedCnt[id] ?? 0) + samples.length;
            file.releaseUsedSamples(id, releasedCnt[id]);
          };

          file.onFlush = () => {
            ctrl.close();
          };
        },
        cancel: () => {
          file.stop();
          streamCancelled = true;
        },
      },
      {
        // 每条消息 100 个 samples
        highWaterMark: 50,
      },
    );

    this.writable = new WritableStream({
      write: async (ui8Arr) => {
        if (streamCancelled) {
          this.writable.abort();
          return;
        }

        const inputBuf = ui8Arr.buffer as MP4ArrayBuffer;
        inputBuf.fileStart = this.#inputBufOffset;
        this.#inputBufOffset += inputBuf.byteLength;
        file.appendBuffer(inputBuf);
      },
      close: () => {
        file.flush();
        file.stop();
        file.onFlush?.();
      },
    });
  }
}
