export interface Tag {
  name: string,
  content: string,
  author_id: string, // TODO: change to ownerId
  public: boolean,
  timeUsed: number,
}

export interface QueuedTag {
  _id: number,
  type: 'add' | 'rename' | 'edit',
  name: string,
  value: string,
  ownerId: string
}