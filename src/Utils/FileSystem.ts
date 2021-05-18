import { readdir } from 'fs/promises'
import { resolve } from 'path'

namespace FileSystemUtils {
  // https://stackoverflow.com/a/45130990
  export async function* getFiles(dir): AsyncGenerator<string> {
    const dirents = await readdir(dir, { withFileTypes: true })
    for (const dirent of dirents) {
      const res: string = resolve(dir, dirent.name)
      if (dirent.isDirectory()) {
        yield* getFiles(res)
      } else {
        yield res
      }
    }
  }
}

export default FileSystemUtils
