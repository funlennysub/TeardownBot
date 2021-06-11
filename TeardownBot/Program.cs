using System;
using System.IO;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using DSharpPlus;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using TeardownBot.Config;
using TeardownBot.Discord;
using TeardownBot.Mongo;

namespace TeardownBot
{
  internal class Program
  {
    public static readonly EventId BotEventId = new(0, "Teardown-bot");

    public static async Task Main(string[] args)
    {
      if (args.Length < 2)
      {
        await Console.Error.WriteLineAsync("Invalid arguments.\nUsage: [CONFIG_FILE_PATH] [TRUE/FALSE]. false - prod, true - dev");
        return;
      }

      await using var fs = File.OpenRead(args[0]);
      using var sr = new StreamReader(fs, new UTF8Encoding(false));
      var json = await sr.ReadToEndAsync();

      var content = JsonSerializer.Deserialize<ConfigFile>(json);
      if (content is null)
      {
        await Console.Error.WriteLineAsync("Something is wrong");
        return;
      }

      ConfigFile.Current = content;

      new Program().RunBotAsync(args).GetAwaiter().GetResult();
    }

    private async Task RunBotAsync(string[] args)
    {
      var config = new DiscordConfiguration
      {
        // false - prod, true - dev
        Token = args[1] == "false" ? ConfigFile.Current.ProdToken : ConfigFile.Current.DevToken,
        TokenType = TokenType.Bot,
        AutoReconnect = true,
        MinimumLogLevel = LogLevel.Information,
        // AlwaysCacheMembers = true,
        Intents = DiscordIntents.Guilds | DiscordIntents.GuildMembers |
                  DiscordIntents.GuildIntegrations | DiscordIntents.GuildMessages |
                  DiscordIntents.GuildPresences | DiscordIntents.GuildMessageReactions
      };

      var discordClient = new DiscordClient(config);
      var services = new ServiceCollection()
        .AddSingleton(discordClient)
        .AddSingleton<IMongoConnection, MongoConnection>(_ => new MongoConnection())
        .AddSingleton<IClient, Client>()
        .BuildServiceProvider();

      var client = (Client) services.GetService(typeof(IClient));

      await client.Start();
      await Task.Delay(-1);
    }
  }
}