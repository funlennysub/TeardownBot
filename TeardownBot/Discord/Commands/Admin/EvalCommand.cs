using System;
using System.Linq;
using System.Threading.Tasks;
using DSharpPlus;
using DSharpPlus.CommandsNext;
using DSharpPlus.CommandsNext.Attributes;
using DSharpPlus.Entities;
using Microsoft.CodeAnalysis.CSharp.Scripting;
using Microsoft.CodeAnalysis.Scripting;

namespace TeardownBot.Discord.Commands.Admin
{
  public class EvalCommand : BaseCommandModule
  {
    [Command("eval"), Aliases("e"), Description("Evaluates csharp code"), Hidden, RequireOwner]
    public async Task Eval(CommandContext ctx, [RemainingText] string code)
    {
      var msg = ctx.Message;

      int cs1 = code.IndexOf("```", StringComparison.Ordinal) + 3;
      cs1 = code.IndexOf('\n', cs1) + 1;
      int cs2 = code.LastIndexOf("```", StringComparison.Ordinal);

      if (cs1 is -1 || cs2 is -1)
      {
        cs1 = 0;
        cs2 = code.Length;
      }

      string cs = code.Substring(cs1, cs2 - cs1);

      msg = await ctx.RespondAsync(embed: new DiscordEmbedBuilder()
        .WithColor(new DiscordColor("#FF007F"))
        .WithDescription("Evaluating...")
        .Build()).ConfigureAwait(false);

      try
      {
        var globals = new TestVariables(ctx.Message, ctx.Client, ctx);

        var sopts = ScriptOptions.Default;
        sopts = sopts.WithImports("System", "System.Collections.Generic", "System.Linq", "System.Text", "System.Threading.Tasks",
          "DSharpPlus", "DSharpPlus.Entities", "DSharpPlus.CommandsNext", "DSharpPlus.Interactivity", "DSharpPlus.SlashCommands",
          "TeardownBot.Mongo", "TeardownBot.Mongo.Collections", "TeardownBot.Utils", "MongoDB.Driver", "MongoDB.Driver.Linq",
          "Microsoft.Extensions.Logging");
        sopts = sopts.WithReferences(AppDomain.CurrentDomain.GetAssemblies()
          .Where(xa => !xa.IsDynamic && !string.IsNullOrWhiteSpace(xa.Location)));

        var script = CSharpScript.Create(cs, sopts, typeof(TestVariables));
        script.Compile();
        var result = await script.RunAsync(globals).ConfigureAwait(false);

        if (result is not null && result.ReturnValue is not null && !String.IsNullOrWhiteSpace(result.ReturnValue.ToString()))
        {
          var embed = new DiscordEmbedBuilder()
            .WithTitle("Evaluation Result")
            .WithDescription(result.ReturnValue.ToString())
            .WithColor(new DiscordColor(0x007FFF))
            .Build();
          await msg.ModifyAsync(embed).ConfigureAwait(false);
        }
        else
        {
          var embed = new DiscordEmbedBuilder()
            .WithTitle("Evaluation Successful")
            .WithDescription("No result was returned.")
            .WithColor(new DiscordColor(0x007FFF))
            .Build();
          await msg.ModifyAsync(embed).ConfigureAwait(false);
        }
      }
      catch (Exception ex)
      {
        var embed = new DiscordEmbedBuilder()
          .WithTitle("Evaluation Failure")
          .WithDescription(string.Concat("**", ex.GetType().ToString(), "**: ", ex.Message))
          .WithColor(new DiscordColor(0xFF0000))
          .Build();
        await msg
          .ModifyAsync(embed)
          .ConfigureAwait(false);
      }
    }
  }

  public class TestVariables
  {
    public DiscordMessage Message { get; set; }
    public DiscordChannel Channel { get; set; }
    public DiscordGuild Guild { get; set; }
    public DiscordUser User { get; set; }
    public DiscordMember Member { get; set; }
    public CommandContext Context { get; set; }

    public TestVariables(DiscordMessage msg, DiscordClient client, CommandContext ctx)
    {
      this.Client = client;

      this.Message = msg;
      this.Channel = msg.Channel;
      this.Guild = this.Channel.Guild;
      this.User = this.Message.Author;
      if (this.Guild != null)
        this.Member = this.Guild.GetMemberAsync(this.User.Id).ConfigureAwait(false).GetAwaiter().GetResult();
      this.Context = ctx;
    }

    public DiscordClient Client;
  }
}