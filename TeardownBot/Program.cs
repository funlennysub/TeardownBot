using System;
using System.Threading.Tasks;
using DSharpPlus;
using DSharpPlus.SlashCommands;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using TeardownBot.Database;
using TeardownBot.Discord;
using TeardownBot.GameDocs;

namespace TeardownBot
{
  class Program
  {
    static async Task Main(string[] args)
    {
      var config = new Config();

      var discordConfig = new DiscordConfiguration
      {
#if DEBUG
        Token = config.Entries.DevToken,
#else
        Token = config.Entries.Token,
#endif
        TokenType = TokenType.Bot,
        AutoReconnect = true,
        MinimumLogLevel = LogLevel.Information,
        Intents = DiscordIntents.Guilds | DiscordIntents.GuildMembers | DiscordIntents.GuildIntegrations |
                  DiscordIntents.GuildMessages | DiscordIntents.GuildPresences
      };

      var discordClient = new DiscordClient(discordConfig);
      var docs = new Docs();
      await docs.WriteDocs();

      discordClient.ClientErrored += (_, eventArgs) =>
      {
        Console.WriteLine(eventArgs.Exception.ToString());
        return Task.CompletedTask;
      };

      var serviceProvider = new ServiceCollection()
        .AddSingleton(discordClient)
        .AddSingleton<IMongoConnection, MongoConnection>(_ => new MongoConnection())
        .AddSingleton<IConfig>(config)
        .AddSingleton(docs)
        .BuildServiceProvider(true);

      serviceProvider.ResolveCommands();

      await discordClient.ConnectAsync();
      var slash = discordClient.GetExtension<SlashCommandsExtension>();
      var _ = new ClientEventHandler(
        discordClient, slash, (IMongoConnection)serviceProvider.GetService(typeof(IMongoConnection))
      );

      await Task.Delay(-1);
    }
  }
}