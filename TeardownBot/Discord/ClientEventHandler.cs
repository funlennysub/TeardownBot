using System;
using System.Linq;
using System.Threading.Tasks;
using DSharpPlus;
using DSharpPlus.Entities;
using DSharpPlus.SlashCommands;
using DSharpPlus.SlashCommands.Attributes;
using TeardownBot.Database;
using TeardownBot.Discord.Attributes;

namespace TeardownBot.Discord
{
  public class ClientEventHandler
  {
    private readonly DiscordClient _client;
    private readonly SlashCommandsExtension _slash;
    private readonly IMongoConnection _mongo;

    public ClientEventHandler(DiscordClient client, SlashCommandsExtension slash, IMongoConnection mongo)
    {
      this._client = client;
      this._slash = slash;
      this._mongo = mongo;

      this._client.Ready += (_, _) =>
      {
        Console.WriteLine($"{this._client.CurrentUser.Username} ready.");
        return Task.CompletedTask;
      };

      this._slash.SlashCommandErrored += async (s, args) =>
      {
        if (args.Exception is SlashExecutionChecksFailedException slex)
        {
          foreach (var check in slex.FailedChecks)
          {
            switch (check)
            {
              case SlashRequireUserPermissionsAttribute slashRequireUserPermissionsAttribute:
                var ruContent =
                  $"Not enough permissions. You need: {slashRequireUserPermissionsAttribute.Permissions.ToPermissionString()}";
                await args.Context.CreateResponseAsync(InteractionResponseType.ChannelMessageWithSource,
                  new DiscordInteractionResponseBuilder().WithContent(ruContent).AsEphemeral(true));
                break;
              case SlashRequireOwnerAttribute slashRequireOwnerAttribute:
                var roContent =
                  $"You have to be a bot owner to use that command.";
                await args.Context.CreateResponseAsync(InteractionResponseType.ChannelMessageWithSource,
                  new DiscordInteractionResponseBuilder().WithContent(roContent).AsEphemeral(true));
                break;
              case SlashRequiredChannelsAttribute slashRequiredChannelsAttribute:
                var rcContent =
                  $"You can only use this command in allowed channels, such as {String.Join(", ", slashRequiredChannelsAttribute.RequiredChannels.Select(x => $"<#{x}>"))}";
                await args.Context.CreateResponseAsync(InteractionResponseType.ChannelMessageWithSource,
                  new DiscordInteractionResponseBuilder().WithContent(rcContent).AsEphemeral(true));
                break;
            }
          }
        }
      };
    }
  }
}