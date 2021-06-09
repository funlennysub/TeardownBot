namespace TeardownBot.Config
{
  public class ConfigFile
  {
    public static ConfigFile Current;
    public string ProdToken { get; set; }
    public string DevToken { get; set; }
    public string Prefix { get; set; }
    public string DatabaseHost { get; set; }
    public string DatabaseUsername { get; set; }
    public string DatabasePassword { get; set; }
  }
}