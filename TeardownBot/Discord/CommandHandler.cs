using System;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using DSharpPlus;
using DSharpPlus.CommandsNext;
using DSharpPlus.CommandsNext.Exceptions;
using DSharpPlus.Entities;
using DSharpPlus.SlashCommands;
using DSharpPlus.SlashCommands.EventArgs;
using Microsoft.Extensions.Logging;
using TeardownBot.Config;

namespace TeardownBot.Discord
{
  public class CommandHandler
  {
    private readonly IServiceProvider _services;
    private readonly DiscordClient _discordClient;

    public CommandHandler(IServiceProvider services, DiscordClient discordClient)
    {
      _services = services;
      _discordClient = discordClient;
    }

    public async Task InitializeAsync()
    {
      var nextConfiguration = new CommandsNextConfiguration
      {
        StringPrefixes = new[] {ConfigFile.Current.Prefix},
        Services = _services,
        EnableDms = false,
        EnableMentionPrefix = false
      };

      var slashCommandsConfiguration = new SlashCommandsConfiguration
      {
        Services = _services
      };

      var commands = _discordClient.UseCommandsNext(nextConfiguration);
      var slashCommands = _discordClient.UseSlashCommands(slashCommandsConfiguration);

      commands.RegisterCommands(Assembly.GetExecutingAssembly());
      foreach (var a in Assembly.GetExecutingAssembly().GetTypes()
        .Where(e => e.IsClass && !e.IsAbstract && e.IsSubclassOf(typeof(SlashCommandModule))))
        slashCommands.RegisterCommands(a, 760105076755922996);

      commands.CommandExecuted += Commands_CommandExecuted;
      slashCommands.SlashCommandExecuted += SlashCommands_CommandExecuted;
      commands.CommandErrored += Commands_CommandErrored;
      slashCommands.SlashCommandErrored += SlashCommands_CommandErrored;
    }

    private Task Commands_CommandExecuted(CommandsNextExtension sender, CommandExecutionEventArgs e)
    {
      e.Context.Client.Logger.LogInformation(Program.BotEventId,
        $"{e.Context.User.Username} successfully executed '{e.Command.QualifiedName}'");

      return Task.CompletedTask;
    }

    private Task SlashCommands_CommandExecuted(SlashCommandsExtension sender, SlashCommandExecutedEventArgs e)
    {
      e.Context.Client.Logger.LogInformation(Program.BotEventId,
        $"{e.Context.User.Username} successfully executed '{e.Context.CommandName}'");

      return Task.CompletedTask;
    }

    private async Task Commands_CommandErrored(CommandsNextExtension sender, CommandErrorEventArgs e)
    {
      // let's log the error details
      var err =
        $"{e.Context.User.Username} tried executing '{e.Command?.QualifiedName ?? "<unknown command>"}' but it errored: {e.Exception.GetType()}: {e.Exception.Message ?? "<no message>"}";
      e.Context.Client.Logger.LogError(Program.BotEventId, err, DateTime.Now);

      var tempEmbed = new DiscordEmbedBuilder
      {
        Color = new DiscordColor(0xFF0000)
      };

      await e.Context.RespondAsync(tempEmbed
        .WithTitle("Error")
        .WithDescription(err));

      if (e.Exception is ChecksFailedException ex)
      {
        var emoji = DiscordEmoji.FromName(e.Context.Client, ":no_entry:");

        await e.Context.RespondAsync(tempEmbed
          .WithTitle("Access Denied")
          .WithDescription($"{emoji} You do not have the permissions required to execute this command."));
      }
    }

    private async Task SlashCommands_CommandErrored(SlashCommandsExtension sender, SlashCommandErrorEventArgs e)
    {
      // let's log the error details
      var err =
        $"{e.Context.User.Username} tried executing '{e.Context.CommandName ?? "<unknown command>"}' but it errored: {e.Exception.GetType()}: {e.Exception.Message ?? "<no message>"}";
      e.Context.Client.Logger.LogError(Program.BotEventId, err, DateTime.Now);

      var tempEmbed = new DiscordEmbedBuilder {Color = new DiscordColor(0xFF0000)};

      await e.Context.CreateResponseAsync(
        InteractionResponseType.ChannelMessageWithSource,
        new DiscordInteractionResponseBuilder(new DiscordMessageBuilder()
        {
          Embed = tempEmbed.WithTitle("Error").WithDescription(err)
        })
      );

      if (e.Exception is ChecksFailedException ex)
      {
        var emoji = DiscordEmoji.FromName(e.Context.Client, ":no_entry:");

        await e.Context.CreateResponseAsync(
          InteractionResponseType.ChannelMessageWithSource,
          new DiscordInteractionResponseBuilder(new DiscordMessageBuilder()
          {
            Embed = tempEmbed
              .WithTitle("Access Denied")
              .WithDescription($"{emoji} You do not have the permissions required to execute this command.")
          })
        );
      }
    }
  }
}