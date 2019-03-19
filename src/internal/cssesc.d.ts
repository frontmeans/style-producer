declare module 'cssesc' {

  function cssesc(string: string, options?: Readonly<Partial<cssesc.Options>>): string;

  namespace cssesc {
    interface Options {
      escapeEverything: boolean;
      isIdentifier: boolean;
      quotes: string;
      wrap: boolean;
    }

    const options: Options;

    const version: string;
  }

  export default cssesc;

}
