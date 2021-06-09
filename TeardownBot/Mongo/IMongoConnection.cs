using MongoDB.Driver;

namespace TeardownBot.Mongo
{
  public interface IMongoConnection
  {
    public IMongoDatabase MainDb { get; }
  }
}