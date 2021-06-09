using System;
using System.Text.RegularExpressions;
using DSharpPlus.Entities;

namespace TeardownBot.Utils
{
  public static class DiscordExtensions
  {
    public static string FormatDiscordUser(DiscordUser user)
    {
      return $"{user.Mention} ({user.Username}#{user.Discriminator})";
    }

    public static string ClearString(string str)
    {
      return Regex.Replace(str, @"/([*_~`>\\])/g", m => $"\\{m.Groups[1].Value}");
    }
  }
}