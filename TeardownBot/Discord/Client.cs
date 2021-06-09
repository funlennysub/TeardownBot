using System;
using System.Threading.Tasks;
using DSharpPlus;
using DSharpPlus.EventArgs;
using DSharpPlus.Interactivity.Extensions;
using Microsoft.Extensions.Logging;

namespace TeardownBot.Discord
{
  public class Client : IClient
  {
    private readonly IServiceProvider _serviceProvider;
    public DiscordClient DiscordClient { get; }

    public Client(IServiceProvider serviceProvider, DiscordClient discordClient)
    {
      _serviceProvider = serviceProvider;
      DiscordClient = discordClient;
    }

    public async Task Start()
    {
      await new CommandHandler(_serviceProvider, DiscordClient).InitializeAsync();
      DiscordClient.UseInteractivity();
      await DiscordClient.ConnectAsync();

      DiscordClient.Ready += Client_Ready;
    }

    private Task Client_Ready(DiscordClient sender, ReadyEventArgs e)
    {
      sender.Logger.LogInformation(Program.BotEventId, $"{sender.CurrentUser.Username} is ready!");
      return Task.CompletedTask;
    }
  }
}