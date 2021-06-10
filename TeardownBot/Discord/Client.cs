using System;
using System.Threading.Tasks;
using DSharpPlus;
using DSharpPlus.Interactivity.Extensions;
using TeardownBot.Discord.Events;

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
      
      var _ = new DiscordEventHandler(DiscordClient);
    }
  }
}