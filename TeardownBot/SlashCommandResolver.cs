using System;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using DSharpPlus;
using DSharpPlus.SlashCommands;
using Microsoft.Extensions.DependencyInjection;
using TeardownBot.Discord;

namespace TeardownBot
{
  public static class SlashCommandResolver
  {
    public static void ResolveCommands(this IServiceProvider serviceProvider)
    {
      var client = serviceProvider.GetService<DiscordClient>();
      var slashCommands = client.UseSlashCommands(new SlashCommandsConfiguration
      {
        Services = serviceProvider
      });

      slashCommands.SlashCommandErrored += (_, args) =>
      {
        if (args.Exception is SlashExecutionChecksFailedException) return Task.CompletedTask;

        Console.WriteLine($"Command {args.Context.CommandName} errored:\n{args.Exception}");
        return Task.CompletedTask;
      };

      foreach (var type in Assembly.GetExecutingAssembly().GetTypes()
        .Where(e => e.IsClass && !e.IsAbstract && e.IsSubclassOf(typeof(ApplicationCommandModule))))
      {
        Console.WriteLine("Registered " + type.FullName);
        slashCommands.RegisterCommands(type, Constants.Guilds.TeardownDiscordId);
      }
    }
  }
}