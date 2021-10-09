using MongoDB.Driver;

namespace TeardownBot.Database
{
  public interface IMongoConnection
  {
    public IMongoDatabase MainDatabase { get; }
  }
}