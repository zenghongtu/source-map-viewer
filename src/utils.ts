import Stacktracey from 'stacktracey';
import SourceMap from 'source-map';

export interface ISourceMap {
  version: number;
  file: string;
  names: string[];
  sources: string[];
  sourceRoot: string;
  mappings: string;
}

export interface ISource {
  sourceContent: string | null;
  source: string | null;
  line: number | null;
  column: number | null;
  name: string | null;
}

// TODO
SourceMap.SourceMapConsumer.initialize({
  'lib/mappings.wasm': 'https://unpkg.com/source-map@0.7.3/lib/mappings.wasm'
});

export class SMLookup {
  sourceMapConsumer: SourceMap.SourceMapConsumer | null = null;

  constructor(sourceMapObj: ISourceMap) {
    // @ts-ignore
    return (async () => {
      await this.setSourceMapConsumer(sourceMapObj);
      return this;
    })();
  }

  /**
   *
   * @param sourceMapObj source map object
   */
  async setSourceMapConsumer(sourceMapObj: ISourceMap) {
    return (this.sourceMapConsumer = await new SourceMap.SourceMapConsumer(
      sourceMapObj
    ));
  }

  /**
   *
   * @param l line
   * @param c colum
   */
  getSource(l: number, c: number): ISource | null {
    if (!this.sourceMapConsumer) {
      throw new Error('Not Found this.sourceMapConsumer');
    }
    const originPosition = this.sourceMapConsumer.originalPositionFor({
      line: l,
      column: c
    });

    if (!originPosition.source) {
      return null;
    }

    const sourceContent = this.sourceMapConsumer.sourceContentFor(
      originPosition.source
    );
    return { ...originPosition, sourceContent };
  }
}

export const errorStackParse = (errorStack: string) => {
  const tracey = new Stacktracey(errorStack);
  return tracey;
};
