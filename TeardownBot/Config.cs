using System.IO;
using System.Text.Json;
using TeardownBot.Json;

namespace TeardownBot
{
  public record Configuration(
    string Token,
    string DevToken
  );

  public interface IConfig
  {
    Configuration Entries { get; }
  }

  public class Config : IConfig
  {
    private static Configuration ReadConfig()
    {
      var file = new FileInfo("./config.json");
      if (!file.Exists)
        throw new FileNotFoundException(
          "Config file not found, please create config.json file in the root server directory!");

      var fileData = File.ReadAllText(file.FullName);
      var data = JsonSerializer.Deserialize<Configuration>(fileData, JsonOptions.Default);
      if (data is null) throw new FileLoadException("Can't load " + nameof(Configuration) + " config");
      return data;
    }

    public Config()
    {
      this.Entries = ReadConfig();
    }

    public Configuration Entries { get; }
  }
}