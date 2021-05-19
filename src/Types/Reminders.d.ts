export interface Reminder {
  id: number,
  userId: string,
  text: string,
  channel: string,
  guild: string,
  time: number,
}