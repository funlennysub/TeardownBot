using MongoDB.Driver;

namespace TeardownBot.Database
{
  public class MongoConnection : IMongoConnection
  {
    public IMongoDatabase MainDatabase { get; }
    public MongoConnection()
    {
      var client = new MongoClient("mongodb://chalkbot-mongodb:27017/");
      MainDatabase = client.GetDatabase("chalkbot");
    }
  }
}