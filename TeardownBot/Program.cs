using System;
using System.Collections.Generic;
using System.IO;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using DSharpPlus;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using TeardownBot.Config;
using TeardownBot.Discord;
using TeardownBot.Discord.SlashCommands.Docs;
using TeardownBot.Mongo;

namespace TeardownBot
{
  internal class Program
  {
    public static readonly EventId BotEventId = new(0, "TeardownBot");
    public static readonly Dictionary<string, DocsTypes> Docs = new();

    private static readonly JsonSerializerOptions Options = new()
    {
      IncludeFields = true
    };

    private static string DocsUrl =>
      "https://raw.githubusercontent.com/funlennysub/teardown-api-docs-json/latest/%BRANCH%_api.json";

    private static async Task<ConfigFile> ReadConfig(string[] args)
    {
      await using var fs = File.OpenRead(args[0]);
      using var sr = new StreamReader(fs, new UTF8Encoding(false));
      var json = await sr.ReadToEndAsync();

      var content = JsonSerializer.Deserialize<ConfigFile>(json);
      if (content is not null) return content;
      throw new InvalidOperationException("Something is wrong");
    }

    private static async Task<DocsTypes> ReadDocs(string branch)
    {
      var httpClient = new HttpClient();
      var resp = await httpClient.GetAsync(DocsUrl.Replace("%BRANCH%", branch));
      var stream = await resp.Content.ReadAsStreamAsync();
      var docs = await JsonSerializer.DeserializeAsync<DocsTypes>(stream, Options);

      if (docs is null) throw new NullReferenceException("There was an error while trying to get docs");

      return docs;
    }

    public static async Task WriteDocs()
    {
      Docs["stable"] = await ReadDocs("stable");
      Docs["exp"] =  await ReadDocs("exp");
    }

    public static async Task Main(string[] args)
    {
      if (args.Length < 2)
      {
        await Console.Error.WriteLineAsync(
          "Invalid arguments.\nUsage: [CONFIG_FILE_PATH] [TRUE/FALSE]. false - prod, true - dev");
        return;
      }

      var content = await ReadConfig(args);
      await WriteDocs();

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