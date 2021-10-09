using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DSharpPlus;
using DSharpPlus.Entities;
using DSharpPlus.SlashCommands;
using TeardownBot.Discord.Attributes;
using TeardownBot.Extensions;
using TeardownBot.GameDocs;

namespace TeardownBot.Discord.SlashCommands.Docs
{
  public class DocsCommand : ApplicationCommandModule
  {
    private readonly DiscordClient _client;
    private readonly TeardownBot.GameDocs.Docs _docs;

    public DocsCommand(DiscordClient client, TeardownBot.GameDocs.Docs docs)
    {
      this._client = client;
      this._docs = docs;
    }

    [SlashRequiredChannels(806440595891290142, 768940642767208468, 780106606456733727)]
    [SlashCommand("docs", "Teardown LUA API documentation")]
    public async Task Docs(InteractionContext ctx,
      [Option("name", "Function name")] string name,
      [Option("version", "Experimental or stable game version")]
      Versions version)
    {
      var doc = this._docs.DocsDictionary[version.GetEnumDescription()];
      
      if (doc is null) throw new NullReferenceException("There was an error while trying to get docs");

      var (cat, func) = FindDoc(name, doc);

      if (cat is null && func is null)
      {
        var errMsg = new DiscordInteractionResponseBuilder()
          .WithContent($"Function `{name}` not found.");
        await ctx.CreateResponseAsync(InteractionResponseType.ChannelMessageWithSource, errMsg);
        return;
      }

      var baseUrl = doc.BaseUrl;
      var funcName = func!.Name;
      var argsFormatted = FormatApiInputsAndOutputs(func.Arguments);
      var returnsFormatted = FormatApiInputsAndOutputs(func.Return);
      var info = func.Info;
      var definition = func.Def;
      var example = $"```lua\n{func.Example}\n```";

      var embed = new DiscordEmbedBuilder();
      embed.WithTitle($"#{funcName}");
      embed.WithUrl($"{baseUrl}#{funcName}");
      embed.WithDescription($"`{definition}`\n\n{info}");
      embed.AddField("Arguments", argsFormatted);
      embed.AddField("Returns", returnsFormatted);
      embed.AddField("Example", example);
      embed.WithFooter($"API(game) Version: {doc.Version}");
      embed.WithColor(new DiscordColor(0xf0d080));

      var msg = new DiscordInteractionResponseBuilder()
        .WithContent($"{baseUrl}#{funcName}")
        .AddEmbed(embed.Build());

      await ctx.CreateResponseAsync(InteractionResponseType.ChannelMessageWithSource, msg);
    }

    private (Api?, Function?) FindDoc(string name, DocsTypes docs)
    {
      var (category, apiFunction) = docs.Api
        .SelectMany(cat => cat.Functions, (cat, func) => new { cat, func })
        .Where(t => string.Equals(t.func.Name, name, StringComparison.InvariantCultureIgnoreCase))
        .Select(t => (t.cat, t.func)).FirstOrDefault();
      return category is null && apiFunction is null
        ? (null, null)
        : (cat: category, func: apiFunction);
    }

    private string FormatApiInputsAndOutputs(IReadOnlyCollection<Param> arguments)
    {
      StringBuilder res = new();
      if (arguments.Count < 1) return res.Append("none").ToString();

      foreach (var arg in arguments)
        res.AppendLine(
          $"`{arg.Name}` ({(arg.Optional is true ? $"{arg.Type}, optional" : arg.Type)}) - {arg.Desc.Replace("&ndash; ", "")}");

      return res.ToString();
    }
  }
}