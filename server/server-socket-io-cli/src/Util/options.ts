import jsonfile from 'jsonfile';

export const parseOptionsFile = async (path: string): Promise<any> => {
  try {
    return await jsonfile.readFile(path);
  } catch (err) {
    console.error(`Could not read the options file at ${path} -- ${(err as Error).message}`);
    return {};
  }
};

export const parseCmdOptions = (options: string[]): any => {
  const collected: any = {};
  for (const option of options) {
    const parsed = option.split('=');
    // Set the options as the value if passed as "key=value" or true if only is given
    collected[parsed[0]] = parsed.length === 2 ? parsed[1] : true;
  }
  return collected;
};
