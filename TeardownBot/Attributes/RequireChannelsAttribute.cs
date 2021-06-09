using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;
using DSharpPlus.CommandsNext;
using DSharpPlus.CommandsNext.Attributes;

namespace TeardownBot.Attributes
{
  /// <summary>
  /// Defines that usage of this command is allowed in specific channels. />.
  /// </summary>
  [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, Inherited = false)]
  public sealed class RequireChannelsAttribute : CheckBaseAttribute
  {
    /// <summary>
    /// Gets the id of the channels required to execute this command.
    /// </summary>
    public IReadOnlyList<ulong> ChannelIds { get; }

    /// <summary>
    /// Defines that usage of this command is allowed in specific channels. />.
    /// </summary>
    /// <param name="channelIds">Id of the channels to be verified by this check.</param>
    public RequireChannelsAttribute(params ulong[] channelIds)
    {
      ChannelIds = new ReadOnlyCollection<ulong>(channelIds);
    }

    public override Task<bool> ExecuteCheckAsync(CommandContext ctx, bool help)
    {
      if (ctx.Guild == null || ctx.Member == null)
        return Task.FromResult(false);
      var channelId = ctx.Channel.Id;
      return Task.FromResult(ChannelIds.Contains(channelId));
    }
  }
}