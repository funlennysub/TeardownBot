namespace TeardownBot.Mongo.Collections
{
  public class RemindersCollection
  {
    public int id { get; set; }
    public long userId { get; set; }
    public string text { get; set; }
    public long channel { get; set; }
    public long guild { get; set; }
    public long time { get; set; }
  }
}