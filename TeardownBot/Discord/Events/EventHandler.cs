using System;
using System.Threading.Tasks;
using DSharpPlus;
using DSharpPlus.Entities;
using DSharpPlus.EventArgs;
using Microsoft.Extensions.Logging;

namespace TeardownBot.Discord.Events
{
  public class DiscordEventHandler
  {
    private const string Thumbsup = "👍";
    private const string Thumbsdown = "👎";
    private const ulong SuggestionsChannel = 806440595891290142;

    public DiscordEventHandler(DiscordClient discordClient)
    {
      discordClient.Ready += OnReady;
      discordClient.MessageCreated += MessageCreate;
    }

    private Task OnReady(DiscordClient s, ReadyEventArgs e)
    {
      s.Logger.LogInformation(Program.BotEventId, $"{s.CurrentUser.Username} is ready!");
      return Task.CompletedTask;
    }

    private Task MessageCreate(DiscordClient s, MessageCreateEventArgs e)
    {
      if (e.Guild is null) return Task.CompletedTask;

      var msg = e.Message;
      var refMsg = e.Message.ReferencedMessage;

      if (!msg.Channel.Id.Equals(SuggestionsChannel) || refMsg is not null) return Task.CompletedTask;
      msg.CreateReactionAsync(DiscordEmoji.FromUnicode(Thumbsup));
      msg.CreateReactionAsync(DiscordEmoji.FromUnicode(Thumbsdown));
      return Task.CompletedTask;
    }
  }
}