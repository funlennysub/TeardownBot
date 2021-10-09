using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace TeardownBot.Json
{
  /// <summary>
  /// Классы, имплементирующие данный интерфейс автоматически создаются,
  /// а все сериализаторы из поля <c>JsonSerializers</c> помещаются в список сериализаторов JSON по умолчанию
  /// Полезно, если нужно добавить сериализаторы, требующие генерик аргументы
  /// </summary>
  public interface IJsonSerializerList
  {
    IEnumerable<JsonConverter> JsonSerializers { get; }
  }

}