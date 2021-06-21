using System;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using DSharpPlus;
using DSharpPlus.Entities;
using DSharpPlus.SlashCommands;
using TeardownBot.Discord;

namespace TeardownBot.Utils
{
  public static class DiscordExtensions
  {
    public static string FormatDiscordUser(DiscordUser user)
    {
      return $"{user.Mention} ({user.Username}#{user.Discriminator})";
    }

    public static string ClearString(string str)
    {
      return Regex.Replace(str, @"/([*_~`>\\])/g", m => $"\\{m.Groups[1].Value}");
    }

    public static async Task SendInvalidChannelError(InteractionContext ctx)
    {
      var guild = ctx.Guild;
      var channels = Constants.AllowedChannels.Select(ch => guild.Channels.FirstOrDefault(r => r.Value.Id == ch).Value.Mention);
      var errMsg = new DiscordInteractionResponseBuilder()
        .WithContent($"You can only use this command in allowed channels, such as: {String.Join(", ", channels)}")
        .AsEphemeral(true);
      await ctx.CreateResponseAsync(InteractionResponseType.ChannelMessageWithSource, errMsg);
    }
  }
}