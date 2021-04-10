export interface Argument {
  name: string,
  type: string,
  optional: boolean,
  desc: string,
}

export interface Return {
  name: string,
  type: string,
  optional: boolean,
  desc: string,
}

export interface APIFunction {
  name: string,
  def: string,
  arguments: Array<Argument>,
  return: Array<Return>,
  info: string,
  example: string,
}

export interface Category {
  category: string,
  desc: string,
  functions: Array<APIFunction>,
}

export interface DocsJSON {
  version: string,
  baseURL: string,
  api: Array<Category>,
}

