using System.Threading.Tasks;
using DSharpPlus;

namespace TeardownBot.Discord
{
  public interface IClient
  {
    public DiscordClient DiscordClient { get; }
    public Task Start();
  }
}