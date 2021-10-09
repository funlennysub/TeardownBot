using System.Threading.Tasks;
using DSharpPlus;
using DSharpPlus.Entities;
using DSharpPlus.SlashCommands;
using DSharpPlus.SlashCommands.Attributes;
using JetBrains.Annotations;

namespace TeardownBot.Discord.SlashCommands.Reload
{
  [UsedImplicitly]
  public class ReloadCommand : ApplicationCommandModule
  {
    private readonly DiscordClient _client;
    private readonly TeardownBot.GameDocs.Docs _docs;

    public ReloadCommand(DiscordClient client, TeardownBot.GameDocs.Docs docs)
    {
      this._client = client;
      this._docs = docs;
    }

    public enum ThingsToReload
    {
      Docs
    }

    [SlashRequireOwner, SlashCommand("reload", "Reload different stuff")]
    public async Task Reload(
      InteractionContext ctx,
      [Option("thing", "Thing to reload")] ThingsToReload thing
    )
    {
      if (thing == ThingsToReload.Docs) await this._docs.WriteDocs();
      await ctx.CreateResponseAsync(InteractionResponseType.ChannelMessageWithSource,
        new DiscordInteractionResponseBuilder().WithContent("done").AsEphemeral(true));
    }
  }
}