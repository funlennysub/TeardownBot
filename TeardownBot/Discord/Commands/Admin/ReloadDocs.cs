using System.Threading.Tasks;
using DSharpPlus.CommandsNext;
using DSharpPlus.CommandsNext.Attributes;

namespace TeardownBot.Discord.Commands.Admin
{
  public class ReloadDocs : BaseCommandModule
  {
    [Command("reloaddocs"), Aliases("rr"), RequireOwner]
    public async Task Reload(CommandContext ctx)
    {
      await Program.WriteDocs();
      await ctx.RespondAsync("Docs successfully reloaded");
    }
  }
}