namespace TeardownBot.Extensions
{
  public static class StringExtensions
  {
    public static string Format(this string @string, string replaceStr, string replaceWith)
    {
      var str = "{" + replaceStr + "}";
      return @string.Replace(str, replaceWith);
    }
  }
}