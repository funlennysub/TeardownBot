export interface Tag {
  name: string,
  content: string,
  ownerId: string,
  public: boolean,
  timeUsed: number,
}

export interface QueuedTag {
  _id: number,
  type: 'add' | 'rename' | 'edit',
  name: string,
  value: string,
  ownerId: string,
}
