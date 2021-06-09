using MongoDB.Driver;
using TeardownBot.Config;

namespace TeardownBot.Mongo
{
  public class MongoConnection : IMongoConnection
  {
    public IMongoDatabase MainDb { get; }
    private const string MainDbName = "teardown";

    public MongoConnection()
    {
      var connectionString =
        $"mongodb+srv://{ConfigFile.Current.DatabaseUsername}:{ConfigFile.Current.DatabasePassword}@cluster0.f8nw7.mongodb.net/";
      var mongoClient = new MongoClient(connectionString);
      MainDb = mongoClient.GetDatabase(MainDbName);
    }
  }
}