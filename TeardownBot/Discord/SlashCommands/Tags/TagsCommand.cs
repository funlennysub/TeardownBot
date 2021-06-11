using System;
using System.Linq;
using System.Threading.Tasks;
using DSharpPlus;
using DSharpPlus.Entities;
using DSharpPlus.SlashCommands;
using MongoDB.Driver;
using MongoDB.Driver.Linq;
using TeardownBot.Mongo;
using TeardownBot.Mongo.Collections;
using TeardownBot.Utils;

namespace TeardownBot.Discord.SlashCommands.Tags
{
  [SlashCommandGroup("tag", "Portable FAQ")]
  public class Tags : SlashCommandModule
  {
    [SlashCommandGroup("tag", "Portable FAQ")]
    public class Group
    {
      private readonly DiscordClient _discordClient;
      private readonly IMongoCollection<TagsCollection> _tagsCollection;

      private enum ActionTypes
      {
        Edit,
        Rename
      };

      public Group(IMongoConnection mongoConnection, DiscordClient discordClient)
      {
        _discordClient = discordClient;
        _tagsCollection = mongoConnection.MainDb.GetCollection<TagsCollection>("tags");
      }

      [SlashCommand("use", "Use an existing tag")]
      public async Task Use(InteractionContext ctx,
        [Option("name", "Tag name")] string name)
      {
        await Constants.CheckChannel(ctx);
        
        var filter = Builders<TagsCollection>.Filter.Eq("name", name);
        var tag = await _tagsCollection
          .AsQueryable()
          .Where(t => t.name.ToLower() == name.ToLower())
          .FirstOrDefaultAsync();

        if (tag is null)
        {
          var errMsg = new DiscordInteractionResponseBuilder().WithContent("Tag not found.").AsEphemeral(true);
          await ctx.CreateResponseAsync(InteractionResponseType.ChannelMessageWithSource, errMsg);
          return;
        }

        var msg = new DiscordInteractionResponseBuilder()
          .WithContent(tag.content.Replace("\\n", "\n"));
        await ctx.CreateResponseAsync(InteractionResponseType.ChannelMessageWithSource, msg);
        var update = Builders<TagsCollection>.Update.Set("timeUsed", tag.timeUsed + 1);
        await _tagsCollection.FindOneAndUpdateAsync(filter, update);
      }

      [SlashCommand("info", "Show info of an existing tag")]
      public async Task Info(InteractionContext ctx,
        [Option("name", "Tag name")] string name)
      {
        await Constants.CheckChannel(ctx);

        var tag = await _tagsCollection
          .AsQueryable()
          .Where(t => t.name.ToLower() == name.ToLower())
          .FirstOrDefaultAsync();

        if (tag is null)
        {
          await ctx.CreateResponseAsync(InteractionResponseType.ChannelMessageWithSource,
            new DiscordInteractionResponseBuilder().WithContent("Tag not found.").AsEphemeral(true));
          return;
        }

        var tagOwner = GetTagOwner(ctx.Guild, (ulong) tag.ownerId);

        var msg = new DiscordInteractionResponseBuilder();
        var embed = new DiscordEmbedBuilder();

        embed.WithTitle("Tag info");
        embed.AddField("Name", name, true);
        embed.AddField("Public", $"{tag.@public}", true);
        embed.AddField("Time used", $"{tag.timeUsed}", true);
        embed.AddField("Owner", $"{DiscordExtensions.FormatDiscordUser(tagOwner)}", true);
        embed.WithColor(new DiscordColor(0x80CBC4));
        embed.WithFooter($"Owner ID: {tagOwner.Id}", tagOwner.AvatarUrl);
        embed.WithTimestamp(DateTime.Now);
        msg.AddEmbed(embed.Build());

        await ctx.CreateResponseAsync(InteractionResponseType.ChannelMessageWithSource, msg);
      }

      [SlashCommand("list", "List all tags")]
      public async Task List(InteractionContext ctx)
      {
        await Constants.CheckChannel(ctx);

        var tags = _tagsCollection.AsQueryable().Where(_ => true).ToList();
        var tagNames = tags.Select(tag => $"`{tag.name}`");

        var msg = new DiscordInteractionResponseBuilder()
          .WithContent(String.Join(", ", tagNames));
        await ctx.CreateResponseAsync(InteractionResponseType.ChannelMessageWithSource, msg);
      }

      [SlashCommand("add", "Create new tag")]
      public async Task Add(InteractionContext ctx,
        [Option("name", "Tag name")] string name,
        [Option("value", "Tag description")] string value)
      {
        await Constants.CheckChannel(ctx);

        var tag = await _tagsCollection
          .AsQueryable()
          .Where(t => t.name.ToLower() == name.ToLower())
          .FirstOrDefaultAsync();
        if (tag is not null)
        {
          var errMsg = new DiscordInteractionResponseBuilder().WithContent($"Tag `{name}` already exists.").AsEphemeral(true);
          await ctx.CreateResponseAsync(InteractionResponseType.ChannelMessageWithSource, errMsg);
          return;
        }

        await _tagsCollection.InsertOneAsync(new TagsCollection(name, value, (long) ctx.Member.Id));

        var msg = new DiscordInteractionResponseBuilder().WithContent($"Tag `{name}` has been created.");
        await ctx.CreateResponseAsync(InteractionResponseType.ChannelMessageWithSource, msg);
      }

      [SlashCommand("delete", "Delete an existing tag")]
      public async Task Delete(InteractionContext ctx,
        [Option("name", "Tag name")] string name)
      {
        await Constants.CheckChannel(ctx);

        var tag = await _tagsCollection
          .AsQueryable()
          .Where(t => t.name.ToLower() == name.ToLower())
          .FirstOrDefaultAsync();

        if (tag is null)
        {
          var errMsg = new DiscordInteractionResponseBuilder()
            .WithContent($"Tag {name} doesn't exist.")
            .AsEphemeral(true);
          await ctx.CreateResponseAsync(InteractionResponseType.ChannelMessageWithSource, errMsg);
          return;
        }

        var tagOwner = GetTagOwner(ctx.Guild, (ulong) tag.ownerId);
        if (Convert.ToUInt64(tag.ownerId) != ctx.Member.Id)
        {
          var errMsg = new DiscordInteractionResponseBuilder()
            .WithContent(
              $"You don't have permissions to delete this tag. Ask tag owner {DiscordExtensions.FormatDiscordUser(tagOwner)}")
            .AsEphemeral(true);
          await ctx.CreateResponseAsync(InteractionResponseType.ChannelMessageWithSource, errMsg);
          return;
        }

        var filter = Builders<TagsCollection>.Filter.Where(t => t.name.ToLower() == name.ToLower());
        await _tagsCollection.FindOneAndDeleteAsync(filter);

        var msg = new DiscordInteractionResponseBuilder().WithContent($"Tag `{name}` has been deleted.");
        await ctx.CreateResponseAsync(InteractionResponseType.ChannelMessageWithSource, msg);
      }

      [SlashCommand("public", "Change the publicity of an existing tag")]
      public async Task Public(InteractionContext ctx,
        [Option("name", "Tag name")] string name,
        [Choice("public", "true")]
        [Choice("private", "false")]
        [Option("value", "Make public or private")] string value)
      {
        await Constants.CheckChannel(ctx);

        var tag = await _tagsCollection
          .AsQueryable()
          .Where(t => t.name.ToLower() == name.ToLower())
          .FirstOrDefaultAsync();

        if (tag is null)
        {
          var errMsg = new DiscordInteractionResponseBuilder()
            .WithContent($"Tag {name} doesn't exist")
            .AsEphemeral(true);
          await ctx.CreateResponseAsync(InteractionResponseType.ChannelMessageWithSource, errMsg);
          return;
        }

        var tagOwner = GetTagOwner(ctx.Guild, (ulong) tag.ownerId);

        if (tagOwner.Id != ctx.Member.Id)
        {
          var errMsg = new DiscordInteractionResponseBuilder()
            .WithContent(
              $"You don't have permissions to delete this tag. Ask tag owner {DiscordExtensions.FormatDiscordUser(tagOwner)}")
            .AsEphemeral(true);
          await ctx.CreateResponseAsync(InteractionResponseType.ChannelMessageWithSource, errMsg);
          return;
        }

        var filter = Builders<TagsCollection>.Filter.Where(t => t.name.ToLower() == name.ToLower());
        var update = Builders<TagsCollection>.Update.Set("public", value == "true");
        await _tagsCollection.FindOneAndUpdateAsync(filter, update);

        var msg = new DiscordInteractionResponseBuilder()
          .WithContent($"Tag `{name}` has been updated. Tag is now {(value == "true" ? "public" : "private")}");
        await ctx.CreateResponseAsync(InteractionResponseType.ChannelMessageWithSource, msg);
      }

      [SlashCommand("rename", "Change the name of an existing tag")]
      public async Task Rename(InteractionContext ctx,
        [Option("name", "Tag name")] string name,
        [Option("value", "New tag name")] string value)
      {
        await Constants.CheckChannel(ctx);

        await EditTag(name, value, ctx, ActionTypes.Rename);
        var msg = new DiscordInteractionResponseBuilder()
          .WithContent($"Tag `{name}` has been updated.");
        await ctx.CreateResponseAsync(InteractionResponseType.ChannelMessageWithSource, msg);
      }

      [SlashCommand("edit", "Change the description of an existing tag")]
      public async Task Edit(InteractionContext ctx,
        [Option("name", "Tag name")] string name,
        [Option("value", "New tag description")] string value)
      {
        await Constants.CheckChannel(ctx);

        await EditTag(name, value, ctx, ActionTypes.Edit);
        var msg = new DiscordInteractionResponseBuilder()
          .WithContent($"Tag `{name}` has been updated.");
        await ctx.CreateResponseAsync(InteractionResponseType.ChannelMessageWithSource, msg);
      }

      private DiscordUser GetTagOwner(DiscordGuild guild, ulong id)
      {
        return guild.Members.FirstOrDefault(m => m.Value.Id == id).Value;
      }

      private async Task EditTag(string name, string value, InteractionContext ctx, ActionTypes actionType)
      {
        var tag = await _tagsCollection
          .AsQueryable()
          .Where(t => t.name.ToLower() == name.ToLower())
          .FirstOrDefaultAsync();

        if (tag is null)
        {
          var errMsg = new DiscordInteractionResponseBuilder()
            .WithContent($"Tag {name} doesn't exist")
            .AsEphemeral(true);
          await ctx.CreateResponseAsync(InteractionResponseType.ChannelMessageWithSource, errMsg);
          return;
        }

        var tagOwner = GetTagOwner(ctx.Guild, (ulong) tag.ownerId);

        if (!tag.@public && (ulong) tag.ownerId != ctx.Member.Id)
        {
          var errMsg = new DiscordInteractionResponseBuilder()
            .WithContent(
              $"You don't have permissions to delete this tag. Ask tag owner {DiscordExtensions.FormatDiscordUser(tagOwner)}")
            .AsEphemeral(true);
          await ctx.CreateResponseAsync(InteractionResponseType.ChannelMessageWithSource, errMsg);
          return;
        }

        var filter = Builders<TagsCollection>.Filter.Where(t => t.name.ToLower() == name.ToLower());
        UpdateDefinition<TagsCollection>? update;
        switch (actionType)
        {
          case ActionTypes.Edit:
            update = Builders<TagsCollection>.Update.Set("content", value);
            await _tagsCollection.FindOneAndUpdateAsync(filter, update);
            break;
          case ActionTypes.Rename:
            update = Builders<TagsCollection>.Update.Set("name", value);
            await _tagsCollection.FindOneAndUpdateAsync(filter, update);
            break;
          default:
            throw new ArgumentOutOfRangeException(nameof(actionType), actionType, null);
        }
      }
    }
  }
}