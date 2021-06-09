using MongoDB.Bson;

namespace TeardownBot.Mongo.Collections
{
  public class TagsCollection
  {
    public ObjectId _id { get; set; }
    public string ownerId { get; set; }
    public string name { get; set; }
    public string content { get; set; }
    public bool @public { get; set; }
    public long timeUsed { get; set; }

    public TagsCollection()
    {
    }

    public TagsCollection(string name, string content, string ownerId)
    {
      this.ownerId = ownerId;
      this.name = name;
      this.content = content;
      @public = false;
      timeUsed = 0;
    }
  }
}