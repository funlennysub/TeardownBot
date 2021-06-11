using System;
using System.Linq;
using System.Threading.Tasks;
using DSharpPlus;
using DSharpPlus.Entities;
using DSharpPlus.SlashCommands;

namespace TeardownBot.Discord
{
  public static class Constants
  {
    public static readonly ulong[] AllowedChannels = {806440595891290142, 768940642767208468, 780106606456733727};

    public static async Task CheckChannel(InteractionContext ctx)
    {
      if (Array.Exists(AllowedChannels, ch => ch == ctx.Channel.Id))
      {
        var guild = ctx.Guild;
        var channels = AllowedChannels.Select(ch => guild.Channels.FirstOrDefault(r => r.Value.Id == ch).Value.Name);
        var msg = new DiscordInteractionResponseBuilder()
          .WithContent($"You can only use this command in allowed channels, such as: {String.Join(", ", channels)}")
          .AsEphemeral(true);
        await ctx.CreateResponseAsync(InteractionResponseType.ChannelMessageWithSource, msg);
      }
    }
  }
}