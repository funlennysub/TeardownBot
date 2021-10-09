using System.ComponentModel;
using System.Text.Json.Serialization;
using DSharpPlus.SlashCommands;
using JetBrains.Annotations;

#pragma warning disable 8618

namespace TeardownBot.GameDocs
{
  public enum Versions
  {
    [Description("stable")] [ChoiceName("Stable")]
    Stable,

    [Description("exp")] [ChoiceName("Experimental")]
    Experimental,
  }

  [UsedImplicitly]
  public class Param
  {
    [JsonPropertyName("name")] public string Name { get; set; }

    [JsonPropertyName("type")] public string Type { get; set; }

    [JsonPropertyName("optional")] public bool Optional { get; set; }

    [JsonPropertyName("desc")] public string Desc { get; set; }
  }

  [UsedImplicitly]
  public class Function
  {
    [JsonPropertyName("name")] public string Name { get; set; }

    [JsonPropertyName("def")] public string Def { get; set; }

    [JsonPropertyName("arguments")] public Param[] Arguments { get; set; }

    [JsonPropertyName("return")] public Param[] Return { get; set; }

    [JsonPropertyName("info")] public string Info { get; set; }

    [JsonPropertyName("example")] public string Example { get; set; }
  }

  [UsedImplicitly]
  public class Api
  {
    [JsonPropertyName("category")] public string Category { get; set; }

    [JsonPropertyName("desc")] public string Desc { get; set; }

    [JsonPropertyName("functions")] public Function[] Functions { get; set; }
  }

  [UsedImplicitly]
  public class DocsTypes
  {
    [JsonPropertyName("version")] public string Version { get; set; }

    [JsonPropertyName("baseURL")] public string BaseUrl { get; set; }

    [JsonPropertyName("api")] public Api[] Api { get; set; }
  }
}