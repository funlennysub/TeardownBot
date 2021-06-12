using System.Threading.Tasks;
using DSharpPlus;
using DSharpPlus.CommandsNext;
using DSharpPlus.CommandsNext.Attributes;
using DSharpPlus.Entities;
using MongoDB.Driver;
using MongoDB.Driver.Linq;
using TeardownBot.Mongo;
using TeardownBot.Mongo.Collections;

namespace TeardownBot.Discord.Commands.Admin
{
  public class YeetTagCommand : BaseCommandModule
  {
    private readonly DiscordClient _discordClient;
    private readonly IMongoCollection<TagsCollection> _tagsCollection;

    public YeetTagCommand(IMongoConnection mongoConnection, DiscordClient discordClient)
    {
      _discordClient = discordClient;
      _tagsCollection = mongoConnection.MainDb.GetCollection<TagsCollection>("tags");
    }

    [Command("yeet"), Description("delete any tag"), Aliases("yt", "deltag"), Hidden, RequireOwner]
    public async Task YeetTag(CommandContext ctx, [RemainingText] string name)
    {
      var tag = await _tagsCollection
        .AsQueryable()
        .Where(t => t.name.ToLower() == name.ToLower())
        .FirstOrDefaultAsync();
      if (tag is null)
      {
        var errMsg = new DiscordMessageBuilder()
          .WithContent($"Tag {name} doesn't exist.");
        await ctx.RespondAsync(errMsg);
        return;
      }

      var filter = Builders<TagsCollection>.Filter.Where(t => t.name.ToLower() == name.ToLower());
      await _tagsCollection.FindOneAndDeleteAsync(filter);

      var msg = new DiscordMessageBuilder().WithContent($"Tag `{name}` has been yeeted");
      await ctx.RespondAsync(msg);
    }
  }
}