using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;
using DSharpPlus.SlashCommands;

namespace TeardownBot.Discord.Attributes
{
  [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
  public class SlashRequiredChannelsAttribute : SlashCheckBaseAttribute
  {
    public IReadOnlyList<ulong> RequiredChannels { get; }

    public SlashRequiredChannelsAttribute(params ulong[] channelIds)
    {
      this.RequiredChannels = new ReadOnlyCollection<ulong>(channelIds);
    }

    public override async Task<bool> ExecuteChecksAsync(InteractionContext ctx)
    {
      var inRequiredChannel = this.RequiredChannels.Contains(ctx.Channel.Id);

      return await Task.FromResult(inRequiredChannel);
    }
  }
}