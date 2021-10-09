using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using TeardownBot.Extensions;
using TeardownBot.Json;

namespace TeardownBot.GameDocs
{
  public class Docs : IDocs
  {

    public Dictionary<string, DocsTypes> DocsDictionary { get; set; }

    public Docs()
    {
      DocsDictionary = new Dictionary<string, DocsTypes>();
    }


    private const string BaseUrl =
      "https://raw.githubusercontent.com/funlennysub/teardown-api-docs-json/latest/%BRANCH%_api.json";

    private async Task<DocsTypes> ReadDocs(string branch)
    {
      var httpClient = new HttpClient();
      var resp = await httpClient.GetAsync(BaseUrl.Replace("%BRANCH%", branch));
      var stream = await resp.Content.ReadAsStreamAsync();
      var docs = await JsonSerializer.DeserializeAsync<DocsTypes>(stream, JsonOptions.Default);

      if (docs is null) throw new NullReferenceException("There was an error while trying to get docs");

      return docs;
    }

    public async Task WriteDocs()
    {
      DocsDictionary[Versions.Stable.GetEnumDescription()] = await ReadDocs("stable");
      DocsDictionary[Versions.Experimental.GetEnumDescription()] = await ReadDocs("exp");
      Console.WriteLine("Docs written.");
    }
  }
}