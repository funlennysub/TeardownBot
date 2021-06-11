using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using DSharpPlus;
using DSharpPlus.Entities;
using DSharpPlus.SlashCommands;
using TeardownBot.Utils;

namespace TeardownBot.Discord.SlashCommands.Docs
{
  public class DocsCommand : SlashCommandModule
  {
    private readonly JsonSerializerOptions _options = new()
    {
      IncludeFields = true
    };

    private const string DocsUrl =
      "https://raw.githubusercontent.com/funlennysub/teardown-api-docs-json/latest/$branch$_api.json";

    [SlashCommand("docs", "Teardown LUA API documentation")]
    public async Task Docs(InteractionContext ctx,
      [Option("name", "function name")] string name,
      [Choice("stable", "stable")]
      [Choice("experimental", "exp")]
      [Option("branch", "Experimental or stable game version")] string branch)
    {
      if (!Array.Exists(Constants.AllowedChannels, ch => ch == ctx.Channel.Id)) return;

      var url = DocsUrl.Replace("$branch$", branch);
      var httpClient = new HttpClient();
      var resp = await httpClient.GetAsync(url);
      var stream = await resp.Content.ReadAsStreamAsync();
      var docs = await JsonSerializer.DeserializeAsync<DocsTypes>(stream, _options);

      if (docs is null) throw new NullReferenceException("There was an error while trying to get docs");
      Console.WriteLine(docs.version);

      var (cat, func) = FindDoc(name, docs);

      if (cat is null && func is null)
      {
        var errMsg = new DiscordInteractionResponseBuilder()
          .WithContent($"Function {DiscordExtensions.ClearString(name)} not found.");
        await ctx.CreateResponseAsync(InteractionResponseType.ChannelMessageWithSource, errMsg);
        return;
      }

      var baseUrl = docs.baseURL;
      var funcName = func.name;
      var argsFormatted = FormatApiInputsAndOutputs(func.arguments);
      var returnsFormatted = FormatApiInputsAndOutputs(func.@return);
      var info = func.info;
      var definition = func.def;
      var example = $"```lua\n{func.example}\n```";

      var embed = new DiscordEmbedBuilder();
      embed.WithTitle($"#{funcName}");
      embed.WithUrl($"{baseUrl}/{funcName}");
      embed.WithDescription($"`{definition}`\n\n{info}");
      embed.AddField("Arguments", argsFormatted);
      embed.AddField("Returns", returnsFormatted);
      embed.AddField("Example", example);
      embed.WithFooter($"API(game) Version: {docs.version}");
      embed.WithColor(new DiscordColor(0xf0d080));

      var msg = new DiscordInteractionResponseBuilder()
        .WithContent($"{baseUrl}/{funcName}")
        .AddEmbed(embed.Build());

      await ctx.CreateResponseAsync(InteractionResponseType.ChannelMessageWithSource, msg);
    }

    private (Category?, ApiFunction?) FindDoc(string name, DocsTypes docs)
    {
      var (category, apiFunction) = docs.api
        .SelectMany(cat => cat.functions, (cat, func) => new {cat, func})
        .Where(t => string.Equals(t.func.name, name, StringComparison.InvariantCultureIgnoreCase))
        .Select(t => (t.cat, t.func)).FirstOrDefault();
      return category is null && apiFunction is null
        ? (null, null)
        : (cat: category, func: apiFunction);
    }

    private string FormatApiInputsAndOutputs(IReadOnlyCollection<ChingChengHanji> arguments)
    {
      StringBuilder res = new();
      if (arguments.Count < 1) return res.Append("none").ToString();

      foreach (var arg in arguments)
        res.AppendLine(
          $"`{arg.name}` ({(arg.optional is true ? $"{arg.type}, optional" : arg.type)}) - {arg.desc.Replace("&ndash; ", "")}");

      return res.ToString();
    }
  }
}