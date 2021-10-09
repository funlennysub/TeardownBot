using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace TeardownBot.Json
{
  public static class JsonOptions
  {
    private static IEnumerable<JsonConverter> GetConverters()
    {
      var staticSerializers =
        from a in AppDomain.CurrentDomain.GetAssemblies()
        from t in a.GetTypes()
        let attributes = t.GetCustomAttributes(typeof(JsonSerializerAttribute), true)
        where attributes is { Length: > 0 }
        select (JsonConverter)Activator.CreateInstance(t);

      var listSerializers =
        from a in AppDomain.CurrentDomain.GetAssemblies()
        from t in a.GetTypes()
        where t.GetInterfaces().Contains(typeof(IJsonSerializerList))
        let instance = (IJsonSerializerList)Activator.CreateInstance(t)
        from s in instance.JsonSerializers
        select s;

      return staticSerializers.Concat(listSerializers).ToList();
    }

    private static readonly List<JsonConverter> DefaultConverters;

    public static readonly JsonSerializerOptions Default;

    public static JsonSerializerOptions WithConverters(params JsonConverter[] converters)
    {
      var options = new JsonSerializerOptions
      {
        IncludeFields = true,
        IgnoreNullValues = true
      };

      foreach (var converter in DefaultConverters)
        options.Converters.Add(converter);
      foreach (var converter in converters)
        options.Converters.Add(converter);

      return options;
    }

    static JsonOptions()
    {
      DefaultConverters = GetConverters().ToList();
      Default = WithConverters();
    }
  }
}