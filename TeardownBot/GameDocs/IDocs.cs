using System.Collections.Generic;

namespace TeardownBot.GameDocs
{
  public interface IDocs
  {
    public Dictionary<string, DocsTypes> DocsDictionary { get; set; }
  }
}