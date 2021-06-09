namespace TeardownBot.Discord.SlashCommands.Docs
{
  public class ChingChengHanji
  {
    public string name { get; set; }
    public string type { get; set; }
    public bool optional { get; set; }
    public string desc { get; set; }
  }

  public class ApiFunction
  {
    public string name { get; set; }
    public string def { get; set; }
    public ChingChengHanji[] arguments { get; set; }
    public ChingChengHanji[] @return { get; set; }
    public string info { get; set; }
    public string example { get; set; }
  }

  public class Category
  {
    public string category { get; set; }
    public string desc { get; set; }
    public ApiFunction[] functions { get; set; }
  }

  public class DocsTypes
  {
    public string version { get; set; }
    public string baseURL { get; set;  }
    public Category[] api { get; set;  }
  }
}